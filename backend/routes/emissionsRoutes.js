import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/summary-all/:year", async (req, res) => {
  try {
    const { year } = req.params;

    const genset = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total FROM scope1_genset WHERE year=$1`,
      [year]
    );
    const kendaraan = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total FROM scope1_kendaraan WHERE year=$1`,
      [year]
    );
    const refrigerant = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total FROM scope1_refrigerant WHERE year=$1`,
      [year]
    );
    const scope2 = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total FROM scope2 WHERE tahun=$1`,
      [year]
    );

    const totalScope1 =
      parseFloat(genset.rows[0].total) +
      parseFloat(kendaraan.rows[0].total) +
      parseFloat(refrigerant.rows[0].total);
    const totalScope2 = parseFloat(scope2.rows[0].total);

    res.json({
      scope1: totalScope1,
      scope2: totalScope2,
      total: totalScope1 + totalScope2,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

/**
 * GET total emisi scope 1 semua kampus per tahun
 */
router.get("/scope1/:year", async (req, res) => {
  try {
    const { year } = req.params;

    // Genset
    const genset = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) AS total 
       FROM scope1_genset
       WHERE year = $1`,
      [year]
    );

    // Kendaraan
    const kendaraan = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) AS total
       FROM scope1_kendaraan
       WHERE year = $1`,
      [year]
    );

    // Refrigerant
    const refrigerant = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) AS total
       FROM scope1_refrigerant
       WHERE year = $1`,
      [year]
    );

    const total = parseFloat(genset.rows[0].total)
                + parseFloat(kendaraan.rows[0].total)
                + parseFloat(refrigerant.rows[0].total);

    res.json({
      total: total,
      sources: [
        { name: "Genset/Boiler", amount: parseFloat(genset.rows[0].total) },
        { name: "Kendaraan Operasional", amount: parseFloat(kendaraan.rows[0].total) },
        { name: "Refrigerant", amount: parseFloat(refrigerant.rows[0].total) },
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

/**
 * GET total emisi scope 2 semua kampus per tahun
 */
router.get("/scope2/:tahun", async (req, res) => {
  try {
    const { tahun } = req.params;

    const listrik = await pool.query(
      `SELECT lokasi, SUM(emisi) as total 
       FROM scope2 
       WHERE tahun = $1
       GROUP BY lokasi
       ORDER BY total DESC
       LIMIT 5`,
      [tahun]
    );

    const totalSemua = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total FROM scope2 WHERE tahun = $1`,
      [tahun]
    );

    res.json({
      total: parseFloat(totalSemua.rows[0].total),
      sources: listrik.rows.map((lokasi) => ({
        name: lokasi.lokasi,
        amount: parseFloat(lokasi.total)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi error di server" });
  }
});

// routes/emissionsRoutes.js
router.get("/scope1-summary/:year", async (req, res) => {
  try {
    const { year } = req.params;

    // total emisi scope 1 dari seluruh tabel
    const gensetResult = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) AS total FROM scope1_genset WHERE year = $1`,
      [year]
    );
    const kendaraanResult = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) AS total FROM scope1_kendaraan WHERE year = $1`,
      [year]
    );
    const refrigerantResult = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) AS total FROM scope1_refrigerant WHERE year = $1`,
      [year]
    );

    const genset = parseFloat(gensetResult.rows[0].total || 0);
    const kendaraan = parseFloat(kendaraanResult.rows[0].total || 0);
    const refrigerant = parseFloat(refrigerantResult.rows[0].total || 0);

    const total = genset + kendaraan + refrigerant;

    // siapkan top 5 penyumbang
    const sources = [
      { name: "Genset/Boiler", amount: genset },
      { name: "Kendaraan Operasional", amount: kendaraan },
      { name: "Refrigerant", amount: refrigerant },
    ]
      .filter((s) => s.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json({
      total: total.toFixed(2),
      sources,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching scope1 summary" });
  }
});

router.get("/scope2-summary/:year", async (req, res) => {
  try {
    const { year } = req.params;

    const result = await pool.query(
      `SELECT lokasi, SUM(emisi) AS total_emisi
       FROM scope2
       WHERE tahun = $1
       GROUP BY lokasi
       ORDER BY total_emisi DESC
       LIMIT 5`,
      [year]
    );

    const sources = result.rows.map((r) => ({
      name: r.lokasi,
      amount: parseFloat(r.total_emisi || 0),
    }));

    const total = sources.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      total: total.toFixed(2),
      sources,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching scope2 summary" });
  }
});

router.get("/summary-campus/:campus/:year", async (req, res) => {
  try {
    const { campus, year } = req.params;

    // mapping nama → id
    const campusMap = {
      ganesha: 1,
      jatinangor: 2
    };
    const campusId = campusMap[campus];
    if (!campusId) return res.status(400).json({ error: "invalid campus" });

    // scope1 genset
    const genset = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total
       FROM scope1_genset
       WHERE year = $1 AND campus_id = $2`,
      [year, campusId]
    );

    // scope1 kendaraan
    const kendaraan = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total
       FROM scope1_kendaraan
       WHERE year = $1 AND campus_id = $2`,
      [year, campusId]
    );

    // scope1 refrigerant
    const refrigerant = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total
       FROM scope1_refrigerant
       WHERE year = $1 AND campus_id = $2`,
      [year, campusId]
    );

    // scope2
    const scope2 = await pool.query(
      `SELECT COALESCE(SUM(emisi),0) as total
       FROM scope2
       WHERE tahun = $1 AND kampus = $2`,
      [year, campus]
    );

    const totalScope1 =
      parseFloat(genset.rows[0].total) +
      parseFloat(kendaraan.rows[0].total) +
      parseFloat(refrigerant.rows[0].total);

    const totalScope2 = parseFloat(scope2.rows[0].total);

    res.json({
      campus,
      year,
      scope1: totalScope1,
      scope2: totalScope2,
      total: totalScope1 + totalScope2,
      breakdown: {
        genset: parseFloat(genset.rows[0].total),
        kendaraan: parseFloat(kendaraan.rows[0].total),
        refrigerant: parseFloat(refrigerant.rows[0].total),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

router.get("/summary-per-year", async (req, res) => {
  try {
    // ambil semua tahun unik dari scope1 dan scope2
    const tahunQuery = await pool.query(`
      SELECT DISTINCT year FROM scope1_genset
      UNION
      SELECT DISTINCT year FROM scope1_kendaraan
      UNION
      SELECT DISTINCT year FROM scope1_refrigerant
      UNION
      SELECT DISTINCT tahun AS year FROM scope2
      ORDER BY year
    `);

    const years = tahunQuery.rows.map((row) => row.year);
    const results = [];

    for (const year of years) {
      const genset = await pool.query(
        `SELECT COALESCE(SUM(emisi),0) AS total FROM scope1_genset WHERE year=$1`, [year]
      );
      const kendaraan = await pool.query(
        `SELECT COALESCE(SUM(emisi),0) AS total FROM scope1_kendaraan WHERE year=$1`, [year]
      );
      const refrigerant = await pool.query(
        `SELECT COALESCE(SUM(emisi),0) AS total FROM scope1_refrigerant WHERE year=$1`, [year]
      );
      const scope2 = await pool.query(
        `SELECT COALESCE(SUM(emisi),0) AS total FROM scope2 WHERE tahun=$1`, [year]
      );

      const total =
        parseFloat(genset.rows[0].total) +
        parseFloat(kendaraan.rows[0].total) +
        parseFloat(refrigerant.rows[0].total) +
        parseFloat(scope2.rows[0].total);

      results.push({ year, emissions: Math.round(total) });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/summary-trend", async (req, res) => {
  try {
    const tahunQuery = await pool.query(`
      SELECT DISTINCT year FROM scope1_genset
      UNION
      SELECT DISTINCT year FROM scope1_kendaraan
      UNION
      SELECT DISTINCT year FROM scope1_refrigerant
      UNION
      SELECT DISTINCT tahun AS year FROM scope2
      ORDER BY year
    `);

    const years = tahunQuery.rows.map((r) => r.year);
    const results = [];

    for (const year of years) {
      const [genset, kendaraan, refrigerant, scope2] = await Promise.all([
        pool.query(`SELECT COALESCE(SUM(emisi), 0) AS total FROM scope1_genset WHERE year = $1`, [year]),
        pool.query(`SELECT COALESCE(SUM(emisi), 0) AS total FROM scope1_kendaraan WHERE year = $1`, [year]),
        pool.query(`SELECT COALESCE(SUM(emisi), 0) AS total FROM scope1_refrigerant WHERE year = $1`, [year]),
        pool.query(`SELECT COALESCE(SUM(emisi), 0) AS total FROM scope2 WHERE tahun = $1`, [year]),
      ]);

      results.push({
        year,
        scope1:
          parseFloat(genset.rows[0].total) +
          parseFloat(kendaraan.rows[0].total) +
          parseFloat(refrigerant.rows[0].total),
        scope2: parseFloat(scope2.rows[0].total),
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data tren emisi" });
  }
});

export default router;
