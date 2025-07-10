import express from "express";
import pool from "../config/db.js";
const router = express.Router();

// mapping kampus
const campusMap = { ganesha: 1, jatinangor: 2 };

// get data baseline + target
router.get("/:campus", async (req, res) => {
  const { campus } = req.params;
  const campusId = campusMap[campus];
  if (!campusId) return res.status(400).json({ error: "invalid campus" });

  try {
    const result = await pool.query(
      "SELECT * FROM baseline_targets WHERE campus_id = $1 ORDER BY created_at DESC LIMIT 1",
      [campusId]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

// simpan baseline + target
router.post("/:campus", async (req, res) => {
  const { campus } = req.params;
  const campusId = campusMap[campus];
  const { baselineYear, baselineEmission, targetYear, targetEmission, evidenceUrl } = req.body;

  if (!campusId) return res.status(400).json({ error: "invalid campus" });

  try {
    await pool.query(
      `INSERT INTO baseline_targets 
        (campus_id, baseline_year, baseline_emission, target_year, target_emission, evidence_url)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (campus_id)
      DO UPDATE SET
        baseline_year = EXCLUDED.baseline_year,
        baseline_emission = EXCLUDED.baseline_emission,
        target_year = EXCLUDED.target_year,
        target_emission = EXCLUDED.target_emission,
        evidence_url = EXCLUDED.evidence_url,
        created_at = NOW()
      `,
      [campusId, baselineYear, baselineEmission, targetYear, targetEmission, evidenceUrl || null]
    );
    res.send("data saved");
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

router.get("/:campus/:year/interpolasi", async (req, res) => {
  const { campus, year } = req.params;
  const campusId = campusMap[campus];
  const y = parseInt(year);

  if (!campusId) return res.status(400).json({ error: "invalid campus" });

  try {
    const result = await pool.query(
      "SELECT * FROM baseline_targets WHERE campus_id = $1 ORDER BY created_at DESC LIMIT 1",
      [campusId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "no baseline data" });
    }
    const row = result.rows[0];
    const { baseline_year, baseline_emission, target_year } = row;

    if (y < baseline_year) {
      return res.status(400).json({ error: "year before baseline" });
    }

    const expectedEmission = baseline_emission * (1 - (y - baseline_year) / (target_year - baseline_year));

    res.json({
      year: y,
      expectedEmission
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

// progress estimator
router.get("/:campus/:year/progress/:reported", async (req, res) => {
  const { campus, year, reported } = req.params;
  const campusId = campusMap[campus];
  const y = parseInt(year);
  const eReported = parseFloat(reported);

  if (!campusId) return res.status(400).json({ error: "invalid campus" });

  try {
    const result = await pool.query(
      "SELECT * FROM baseline_targets WHERE campus_id = $1 ORDER BY created_at DESC LIMIT 1",
      [campusId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "no baseline data" });
    }
    const row = result.rows[0];
    const { baseline_year, baseline_emission, target_year } = row;

    if (y < baseline_year) {
      return res.status(400).json({ error: "year before baseline" });
    }

    const eExpected = baseline_emission * (1 - (y - baseline_year) / (target_year - baseline_year));

    let progress = ((eExpected - eReported) / eExpected) * 100;

    // normalisasi
    if (progress > 100) progress = 100;
    if (progress < 0) progress = 0;

    res.json({
      year: y,
      expectedEmission: eExpected,
      reportedEmission: eReported,
      progress
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});
// get all baseline & target for all campuses
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        bt.*, 
        c.name as campus_name 
      FROM baseline_targets bt
      JOIN campuses c ON bt.campus_id = c.campus_id
      ORDER BY bt.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

export default router;