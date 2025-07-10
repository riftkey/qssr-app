import express from "express";
import pool from "../config/db.js";
const router = express.Router();

const campusMap = {
  ganesha: 1,
  jatinangor: 2,
};

// GET
router.get("/:campus/:year", async (req, res) => {
  const { campus, year } = req.params;
  const campusId = campusMap[campus];

  if (!campusId) return res.status(400).json({ error: "Invalid campus" });

  try {
    const result = await pool.query(
      "SELECT energy_id, source_type, name, amount_kwh FROM renewable_energy WHERE campus_id = $1 AND year = $2",
      [campusId, year]
    );
    res.json(
      result.rows.map((row) => ({
        sumber: row.source_type,
        nama: row.name,
        amount: row.amount_kwh,
        id: row.energy_id,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// POST
router.post("/:campus/:year", async (req, res) => {
  const { campus, year } = req.params;
  const { data } = req.body;
  const campusId = campusMap[campus];

  if (!campusId) return res.status(400).json({ error: "Invalid campus" });

  try {
    // hapus data lama
    await pool.query(
      "DELETE FROM renewable_energy WHERE campus_id = $1 AND year = $2",
      [campusId, year]
    );

    // insert ulang
    for (const item of data) {
      const amount = parseFloat(item.amount);
      await pool.query(
        "INSERT INTO renewable_energy (campus_id, source_type, name, amount_kwh, year) VALUES ($1,$2,$3,$4,$5)",
        [campusId, item.sumber, item.nama, isNaN(amount) ? 0 : amount, year]
      );
    }

    res.send("Data berhasil disimpan");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
