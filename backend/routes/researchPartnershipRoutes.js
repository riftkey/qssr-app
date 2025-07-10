import express from "express";
import pool from "../config/db.js";
import { Parser } from "json2csv";

const router = express.Router();

router.post("/bulk", async (req, res) => {
  const { partnerships } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const p of partnerships) {
        if (p.id && !isNaN(p.id)) {
          await client.query(
            `
            UPDATE research_partnerships
            SET
              research_title = $1,
              partner_company = $2,
              topic = $3,
              author = $4,
              faculty = $5,
              updated_at = NOW()
            WHERE id = $6
            `,
            [
              p.research_title || null,
              p.partner_company || null,
              p.topic || null,
              p.author || null,
              p.faculty || null,
              p.id,
            ]
          );
        } else {
          await client.query(
            `
            INSERT INTO research_partnerships (
              research_title, partner_company, topic, author, faculty,
              created_at, updated_at
            )
            VALUES ($1,$2,$3,$4,$5, NOW(), NOW())
            `,
            [
              p.research_title || null,
              p.partner_company || null,
              p.topic || null,
              p.author || null,
              p.faculty || null,
            ]
          );
        }
      }

      await client.query("COMMIT");
      res.json({ message: "Research partnerships saved successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Bulk insert error:", err);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM research_partnerships`);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM research_partnerships WHERE id = $1`, [id]);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

// EXPORT CSV
router.get("/export", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM research_partnerships`);
    const fields = [
      { label: "Judul Penelitian", value: "research_title" },
      { label: "Mitra Perusahaan", value: "partner_company" },
      { label: "Topik", value: "topic" },
      { label: "Penulis", value: "author" },
      { label: "Fakultas", value: "faculty" },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment("research_partnerships.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export CSV error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
