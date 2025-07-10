import express from "express";
import pool from "../config/db.js";
import { getDataCollectionByCodeAndYear } from "../controllers/dataCollectionController.js";

const router = express.Router();

// GET data collection by code + year
router.get("/:code/:year", getDataCollectionByCodeAndYear);

// GET daftar indikator
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        indicator_id,
        code,
        name as indicator,
        description,
        lens_category as lens,
        weight,
        source_data as source
      FROM indicators
      WHERE is_active = true
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data indikator" });
  }
});

// ✅ Versi final submit: dari React, upload ke Supabase, lalu simpan path ke DB
router.post("/submit", async (req, res) => {
  try {
    const {
      indicator_id,
      subindicator_id,
      year,
      value,
      evidence_url,
      submitted_by,
      document_path, // path dari frontend (Supabase)
    } = req.body;

    const check = await pool.query(
      `SELECT data_id FROM data_collection WHERE indicator_id = $1 AND year = $2`,
      [indicator_id, year]
    );

    if (check.rows.length > 0) {
      const dataId = check.rows[0].data_id;

      const update = await pool.query(
        `UPDATE data_collection
         SET value = $1,
             evidence_url = $2,
             document_path = COALESCE($3, document_path),
             submitted_by = $4,
             updated_at = NOW()
         WHERE data_id = $5
         RETURNING *`,
        [value, evidence_url, document_path, submitted_by, dataId]
      );

      return res.json({
        message: "Data berhasil diperbarui",
        data: update.rows[0],
      });
    } else {
      const insert = await pool.query(
        `INSERT INTO data_collection
         (indicator_id, subindicator_id, year, value, evidence_url, document_path, submitted_by, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
         RETURNING *`,
        [
          indicator_id,
          subindicator_id || null,
          year,
          value,
          evidence_url,
          document_path,
          submitted_by,
        ]
      );

      return res.status(201).json({
        message: "Data berhasil disimpan",
        data: insert.rows[0],
      });
    }
  } catch (err) {
    console.error("Gagal menyimpan/update data:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menyimpan data" });
  }
});

// Import
router.post("/import", async (req, res) => {
  const { fromYear, toYear, indicators } = req.body;
  if (!fromYear || !toYear || !indicators) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    for (let indicator_id of indicators) {
      const result = await pool.query(
        `SELECT * FROM data_collection WHERE year = $1 AND indicator_id = $2 LIMIT 1`,
        [fromYear, indicator_id]
      );

      if (result.rows.length === 0) continue;

      const existing = await pool.query(
        `SELECT * FROM data_collection WHERE year = $1 AND indicator_id = $2 LIMIT 1`,
        [toYear, indicator_id]
      );
      if (existing.rows.length > 0) continue; // skip duplikat

      const { value, evidence_url, document_path, submitted_by } = result.rows[0];
      await pool.query(
        `INSERT INTO data_collection (indicator_id, year, value, evidence_url, document_path, submitted_by) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [indicator_id, toYear, value, evidence_url, document_path, submitted_by]
      );
    }

    res.json({ message: "Import berhasil" });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ message: "Gagal import data" });
  }
});

// Preview Import
router.post('/preview-import', async (req, res) => {
  const { fromYear, indicators } = req.body;

  if (!fromYear || !indicators || !Array.isArray(indicators)) {
    return res.status(400).json({ message: "Permintaan tidak valid" });
  }

  try {
    const placeholders = indicators.map((_, i) => `$${i + 1}`).join(',');
    const values = [...indicators];

    const result = await pool.query(
      `SELECT dc.*, i.code, i.name
       FROM data_collection dc
       JOIN indicators i ON dc.indicator_id = i.indicator_id
       WHERE dc.year = $${values.length + 1}
         AND dc.indicator_id IN (${placeholders})`,
      [...values, fromYear]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Preview import error:", err);
    res.status(500).json({ message: "Gagal menampilkan preview" });
  }
});

export default router;
