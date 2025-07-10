import express from "express";
import pool from "../config/db.js";
import { Parser } from "json2csv";

const router = express.Router();

/** === STAFF === */
router.post("/staff/bulk", async (req, res) => {
  const { data } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of data) {
      // validasi faculty jangan kosong
      if (!item.faculty || item.faculty.trim() === "") {
        throw new Error("Faculty tidak boleh kosong");
      }

      if (item.id && !isNaN(item.id)) {
        await client.query(
          `
          UPDATE staff_demographics
          SET faculty=$1, male_count=$2, female_count=$3, updated_at=NOW()
          WHERE id=$4
        `,
          [item.faculty, item.male_count, item.female_count, item.id]
        );
      } else {
        await client.query(
          `
          INSERT INTO staff_demographics(faculty, male_count, female_count, created_at, updated_at)
          VALUES($1,$2,$3,NOW(),NOW())
        `,
          [item.faculty, item.male_count, item.female_count]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Staff data saved" });
  } catch (err) {
    await client.query("ROLLBACK");  // rollback on error
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get("/staff", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM staff_demographics`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/staff/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM staff_demographics WHERE id=$1`, [id]);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** === STUDENT === */
router.post("/student/bulk", async (req, res) => {
  const { data } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of data) {
      if (!item.faculty || item.faculty.trim() === "") {
        throw new Error("Faculty tidak boleh kosong");
      }

      if (item.id && !isNaN(item.id)) {
        await client.query(
          `
          UPDATE student_demographics
          SET faculty=$1, male_count=$2, female_count=$3, updated_at=NOW()
          WHERE id=$4
        `,
          [item.faculty, item.male_count, item.female_count, item.id]
        );
      } else {
        await client.query(
          `
          INSERT INTO student_demographics(faculty, male_count, female_count, created_at, updated_at)
          VALUES($1,$2,$3,NOW(),NOW())
        `,
          [item.faculty, item.male_count, item.female_count]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Student data saved" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


router.get("/student", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM student_demographics`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/student/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM student_demographics WHERE id=$1`, [id]);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** === LEADERSHIP === */
router.post("/leadership/bulk", async (req, res) => {
  const { data } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of data) {
      if (!item.name || item.name.trim() === "") {
        throw new Error("Nama pemimpin tidak boleh kosong");
      }
      if (!item.unit || item.unit.trim() === "") {
        throw new Error("Unit tidak boleh kosong");
      }

      if (item.id && !isNaN(item.id)) {
        await client.query(
          `
          UPDATE leadership_demographics
          SET name=$1, position=$2, gender=$3, unit=$4, updated_at=NOW()
          WHERE id=$5
        `,
          [item.name, item.position, item.gender, item.unit, item.id]
        );
      } else {
        await client.query(
          `
          INSERT INTO leadership_demographics(name, position, gender, unit, created_at, updated_at)
          VALUES($1,$2,$3,$4,NOW(),NOW())
        `,
          [item.name, item.position, item.gender, item.unit]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Leadership data saved" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


router.get("/leadership", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM leadership_demographics`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/leadership/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM leadership_demographics WHERE id=$1`, [id]);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** === SUMMARY RATIO === */
router.get("/summary", async (req, res) => {
  try {
    const staff = await pool.query(`SELECT SUM(male_count) as male, SUM(female_count) as female FROM staff_demographics`);
    const student = await pool.query(`SELECT SUM(male_count) as male, SUM(female_count) as female FROM student_demographics`);
    const leadership = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE gender ILIKE 'male') as male,
        COUNT(*) FILTER (WHERE gender ILIKE 'female') as female
      FROM leadership_demographics
    `);

    res.json({
      staff: staff.rows[0],
      student: student.rows[0],
      leadership: leadership.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
