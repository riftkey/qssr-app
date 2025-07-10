import express from "express";
import pool from "../config/db.js"; // pastikan sudah ada koneksi pool PostgreSQL
const router = express.Router();

// mapping nama kampus ke campus_id di tabel
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
      "SELECT building_id, name, gross_internal_area FROM buildings WHERE campus_id = $1 AND year = $2",
      [campusId, year]
    );
    res.json(
      result.rows.map((row) => ({
        gedung: row.name,
        luas: row.gross_internal_area,
        id: row.building_id,
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
    // hapus dulu data lama di tahun dan kampus itu
    await pool.query(
      "DELETE FROM buildings WHERE campus_id = $1 AND year = $2",
      [campusId, year]
    );

    // insert ulang
    for (const item of data) {
  const luas = parseFloat(item.luas);
  await pool.query(
    "INSERT INTO buildings (campus_id, name, gross_internal_area, year) VALUES ($1, $2, $3, $4)",
    [campusId, item.gedung, isNaN(luas) ? 0 : luas, year]
  );
}


    res.send("Data berhasil disimpan");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
