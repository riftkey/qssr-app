import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * POST scope2 data
 * simpan data listrik scope2 per kampus dan tahun
 */
router.post("/:kampus/:tahun", async (req, res) => {
  try {
    const { kampus, tahun } = req.params;
    const { data } = req.body; // data berupa array objek { lokasi, konsumsi, faktor, emisi }

    // hapus dulu data lama agar sync
    await pool.query(
      `DELETE FROM scope2 WHERE kampus=$1 AND tahun=$2`,
      [kampus, tahun]
    );

    for (const item of data) {
      await pool.query(
        `INSERT INTO scope2 (tahun, kampus, lokasi, konsumsi, faktor_emisi, emisi)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          parseInt(tahun),
          kampus,
          item.lokasi || "",
          parseFloat(item.konsumsi) || 0,
          parseFloat(item.faktor) || 0,
          parseFloat(item.emisi) || 0,
        ]
      );
    }

    res.json({ message: "Data Scope 2 berhasil disimpan." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi error di server." });
  }
});

/**
 * GET scope2 data
 * ambil data listrik scope2 per kampus dan tahun
 */
router.get("/:kampus/:tahun", async (req, res) => {
  try {
    const { kampus, tahun } = req.params;

    const result = await pool.query(
      `SELECT * FROM scope2 WHERE kampus=$1 AND tahun=$2`,
      [kampus, tahun]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi error di server." });
  }
});

export default router;
