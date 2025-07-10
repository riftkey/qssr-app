import pool from "../config/db.js";



export const getDataCollection = async (req, res) => {
  const year = req.query.year || 2025;
  try {
    const result = await pool.query(
      "SELECT * FROM data_collection WHERE year = $1",
      [year]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// fungsi POST data_collection
export const createDataCollection = async (req, res) => {
  const {
    indicator_id,
    subindicator_id,
    year,
    value,
    evidence_url,
    document_path,
    submitted_by,
    validated_by,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO data_collection
        (indicator_id, subindicator_id, year, value, evidence_url, document_path, submitted_by, validated_by, created_at, updated_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
      RETURNING *`,
      [
        indicator_id,
        subindicator_id,
        year,
        value,
        evidence_url,
        document_path,
        submitted_by,
        validated_by,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateDataCollection = async (req, res) => {
  const dataId = req.params.id;

  const {
    indicator_id,
    subindicator_id,
    year,
    value,
    evidence_url,
    document_path,
    submitted_by,
    validated_by,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE data_collection SET
        indicator_id = $1,
        subindicator_id = $2,
        year = $3,
        value = $4,
        evidence_url = $5,
        document_path = $6,
        submitted_by = $7,
        validated_by = $8,
        updated_at = NOW()
      WHERE data_id = $9
      RETURNING *`,
      [
        indicator_id,
        subindicator_id,
        year,
        value,
        evidence_url,
        document_path,
        submitted_by,
        validated_by,
        dataId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteDataCollection = async (req, res) => {
  const dataId = req.params.id;

  try {
    const result = await pool.query(
      `DELETE FROM data_collection WHERE data_id = $1 RETURNING *`,
      [dataId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Data berhasil dihapus", deleted: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};


//uploader
export const createDataCollectionWithFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const {
    indicator_id,
    subindicator_id,
    year,
    value,
    evidence_url,
    submitted_by,
    validated_by,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO data_collection
        (indicator_id, subindicator_id, year, value, evidence_url, document_path, submitted_by, validated_by, created_at, updated_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
      RETURNING *`,
      [
        indicator_id,
        subindicator_id,
        year,
        value,
        evidence_url,
        req.file.path, // ini path file
        submitted_by,
        validated_by,
      ]
    );

    res.status(201).json({
      message: "File uploaded & data saved",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

// controllers/dataCollection.js
export const getDataCollectionByCodeAndYear = async (req, res) => {
  const { code, year } = req.params;

  try {
    const result = await pool.query(`
      SELECT dc.*
      FROM data_collection dc
      JOIN indicators i ON dc.indicator_id = i.indicator_id
      WHERE i.code = $1 AND dc.year = $2
      LIMIT 1
    `, [code, year]);

    if (result.rows.length === 0) {
      return res.json(null); // belum ada data
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
