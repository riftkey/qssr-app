// backend/routes/scope1Routes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// POST scope1 data
router.post("/", async (req, res) => {
  try {
    const { gensetData, kendaraanData, refrigerantData, campus_id, year } = req.body;

    // Hapus data lama supaya sinkron
    await pool.query(`DELETE FROM scope1_genset WHERE campus_id=$1 AND year=$2`, [campus_id, year]);
    await pool.query(`DELETE FROM scope1_kendaraan WHERE campus_id=$1 AND year=$2`, [campus_id, year]);
    await pool.query(`DELETE FROM scope1_refrigerant WHERE campus_id=$1 AND year=$2`, [campus_id, year]);

    // insert ulang
    for (const item of gensetData) {
      const jumlah = item.jumlah === "" ? null : parseFloat(item.jumlah);
      const emisi = item.emisi === "" ? null : parseFloat(item.emisi);

      await pool.query(
        `INSERT INTO scope1_genset 
          (campus_id, kode, bahan_bakar, jumlah, satuan, emisi, year)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          campus_id,
          item.kode || null,
          item.bahanBakar || null,
          jumlah,
          item.satuan || null,
          emisi,
          year
        ]
      );
    }

    for (const item of kendaraanData) {
      const konsumsi = item.konsumsi === "" ? null : parseFloat(item.konsumsi);
      const emisi = item.emisi === "" ? null : parseFloat(item.emisi);
      const unit = item.unit === "" ? null : parseFloat(item.unit);

      await pool.query(
        `INSERT INTO scope1_kendaraan 
          (campus_id, kode, jenis, bahan_bakar, konsumsi, satuan, unit, emisi, year)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          campus_id,
          item.kode || null,
          item.jenis || null,
          item.bahanBakar || null,
          konsumsi,
          item.satuan || null,
          unit,
          emisi,
          year
        ]
      );
    }

    for (const item of refrigerantData) {
      const kapasitas = item.kapasitas === "" ? null : parseFloat(item.kapasitas);
      const estimasiKebocoran = item.estimasiKebocoran === "" ? null : parseFloat(item.estimasiKebocoran);
      const emisi = item.emisi === "" ? null : parseFloat(item.emisi);
      const unit = item.unit === "" ? null : parseFloat(item.unit);

      await pool.query(
            `INSERT INTO scope1_refrigerant 
                (campus_id, kode, tipe, tempat, kapasitas, estimasi_kebocoran, emisi, unit, year, jenis)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
            campus_id,
            item.kode || null,
            item.jenis || null,
            item.tempat || null,
            kapasitas,
            estimasiKebocoran,
            emisi,
            unit,
            year,
            item.jenis || null
            ]
            );

    }

    res.status(200).json({ message: "Data Scope 1 berhasil disimpan dan sinkron!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi error di server" });
  }
});


// GET scope1 data
router.get("/:campus_id/:year", async (req, res) => {
  try {
    const { campus_id, year } = req.params;

    const genset = await pool.query(
      `SELECT * FROM scope1_genset WHERE campus_id=$1 AND year=$2`,
      [campus_id, year]
    );
    const kendaraan = await pool.query(
      `SELECT * FROM scope1_kendaraan WHERE campus_id=$1 AND year=$2`,
      [campus_id, year]
    );
    const refrigerant = await pool.query(
      `SELECT * FROM scope1_refrigerant WHERE campus_id=$1 AND year=$2`,
      [campus_id, year]
    );

    res.status(200).json({
      genset: genset.rows,
      kendaraan: kendaraan.rows,
      refrigerant: refrigerant.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi error di server" });
  }
});

export default router;
