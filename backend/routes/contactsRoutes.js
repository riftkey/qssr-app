import express from "express";
import pool from "../config/db.js";
import { Parser } from "json2csv";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // folder sementara

router.post("/:type/import", upload.single("file"), async (req, res) => {
  const { type } = req.params;

  if (!["academician", "employer"].includes(type)) {
    return res.status(400).json({ error: "Invalid contact type" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      try {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");

          for (const contact of rows) {
            if (type === "employer") {
              await client.query(
                `
                INSERT INTO contacts_employer (
                  source, title, first_name, last_name, position,
                  industry, company_name, country_or_territory,
                  email, phone, created_at, updated_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
                `,
                [
                  contact.source || null,
                  contact.title || null,
                  contact.first_name || null,
                  contact.last_name || null,
                  contact.position || null,
                  contact.industry || null,
                  contact.company_name || null,
                  contact.country_or_territory || null,
                  contact.email || null,
                  contact.phone || null,
                ]
              );
            } else {
              await client.query(
                `
                INSERT INTO contacts_academician (
                  form_institution, pronoun, first_name, last_name,
                  position, department, institution, country,
                  email, discipline, phone_number, created_at, updated_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
                `,
                [
                  contact.form_institution || null,
                  contact.pronoun || null,
                  contact.first_name || null,
                  contact.last_name || null,
                  contact.position || null,
                  contact.department || null,
                  contact.institution || null,
                  contact.country || null,
                  contact.email || null,
                  contact.discipline || null,
                  contact.phone_number || null,
                ]
              );
            }
          }

          await client.query("COMMIT");
          res.json({ message: "Import berhasil" });
        } catch (err) {
          await client.query("ROLLBACK");
          console.error("Import error:", err);
          res.status(500).json({ error: "DB error" });
        } finally {
          client.release();
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      } finally {
        fs.unlinkSync(filePath); // hapus file upload sementara
      }
    });
});



// export CSV
router.get("/:type/export", async (req, res) => {
  const { type } = req.params;

  if (!["academician", "employer"].includes(type)) {
    return res.status(400).json({ error: "Invalid contact type" });
  }

  try {
    const result = await pool.query(`SELECT * FROM contacts_${type}`);

    let fields = [];
    if (type === "employer") {
      fields = [
        "id",
        "source",
        "title",
        "first_name",
        "last_name",
        "position",
        "industry",
        "company_name",
        "country_or_territory",
        "email",
        "phone",
        "created_at",
        "updated_at",
      ];
    } else {
      fields = [
        "id",
        "form_institution",
        "pronoun",
        "first_name",
        "last_name",
        "position",
        "department",
        "institution",
        "country",
        "email",
        "discipline",
        "phone_number",
        "created_at",
        "updated_at",
      ];
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`contacts_${type}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("Export CSV error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// bulk insert/update
router.post("/bulk", async (req, res) => {
  const { type, contacts } = req.body;

  if (!["academician", "employer"].includes(type)) {
    return res.status(400).json({ error: "Invalid contact type" });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const contact of contacts) {
        if (type === "employer") {
          // employer table
          if (contact.id && !isNaN(contact.id)) {
            await client.query(
              `
              UPDATE contacts_employer
              SET
                source = $1,
                title = $2,
                first_name = $3,
                last_name = $4,
                position = $5,
                industry = $6,
                company_name = $7,
                country_or_territory = $8,
                email = $9,
                phone = $10,
                updated_at = NOW()
              WHERE id = $11
              `,
              [
                contact.source || null,
                contact.title || null,
                contact.first_name || null,
                contact.last_name || null,
                contact.position || null,
                contact.industry || null,
                contact.company_name || null,
                contact.country_or_territory || null,
                contact.email || null,
                contact.phone || null,
                contact.id,
              ]
            );
          } else {
            await client.query(
              `
              INSERT INTO contacts_employer (
                source, title, first_name, last_name, position,
                industry, company_name, country_or_territory,
                email, phone, created_at, updated_at
              )
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW(), NOW())
              `,
              [
                contact.source || null,
                contact.title || null,
                contact.first_name || null,
                contact.last_name || null,
                contact.position || null,
                contact.industry || null,
                contact.company_name || null,
                contact.country_or_territory || null,
                contact.email || null,
                contact.phone || null,
              ]
            );
          }
        } else {
          // academician table
          if (contact.id && !isNaN(contact.id)) {
            await client.query(
              `
              UPDATE contacts_academician
              SET
                form_institution = $1,
                pronoun = $2,
                first_name = $3,
                last_name = $4,
                position = $5,
                department = $6,
                institution = $7,
                country = $8,
                email = $9,
                discipline = $10,
                phone_number = $11,
                updated_at = NOW()
              WHERE id = $12
              `,
              [
                contact.form_institution || null,
                contact.pronoun || null,
                contact.first_name || null,
                contact.last_name || null,
                contact.position || null,
                contact.department || null,
                contact.institution || null,
                contact.country || null,
                contact.email || null,
                contact.discipline || null,
                contact.phone_number || null,
                contact.id,
              ]
            );
          } else {
            await client.query(
              `
              INSERT INTO contacts_academician (
                form_institution, pronoun, first_name, last_name,
                position, department, institution, country,
                email, discipline, phone_number, created_at, updated_at
              )
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW(), NOW())
              `,
              [
                contact.form_institution || null,
                contact.pronoun || null,
                contact.first_name || null,
                contact.last_name || null,
                contact.position || null,
                contact.department || null,
                contact.institution || null,
                contact.country || null,
                contact.email || null,
                contact.discipline || null,
                contact.phone_number || null,
              ]
            );
          }
        }
      }

      await client.query("COMMIT");
      res.json({ message: "Contacts saved successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Bulk insert error:", err);
      res.status(500).json({ error: "Failed to save contacts" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// get
router.get("/:type", async (req, res) => {
  const { type } = req.params;
  const { search } = req.query;

  if (!["academician", "employer"].includes(type)) {
    return res.status(400).json({ error: "Invalid contact type" });
  }

  try {
    let query = `SELECT * FROM contacts_${type}`;
    const values = [];

    if (search) {
      if (type === "employer") {
        query += ` WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR company_name ILIKE $1`;
      } else {
        query += ` WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR institution ILIKE $1`;
      }
      values.push(`%${search}%`);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch contacts error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// delete
router.delete("/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  if (!["academician", "employer"].includes(type)) {
    return res.status(400).json({ error: "Invalid contact type" });
  }

  try {
    await pool.query(`DELETE FROM contacts_${type} WHERE id = $1`, [id]);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("Delete contact error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
