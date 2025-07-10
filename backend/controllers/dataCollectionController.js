import pool from "../config/db.js";
import ExcelJS from "exceljs";



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




;

export const exportDataCollectionExcel = async (req, res) => {
  const { year } = req.query;

  if (!year) {
    return res.status(400).json({ message: "Tahun harus disertakan" });
  }

  try {
    // Fetch data gabungan
    const { rows } = await pool.query(
      `SELECT dc.*, i.code, i.name AS indicator_name, i.lens_category, i.category
       FROM data_collection dc
       JOIN indicators i ON dc.indicator_id = i.indicator_id
       WHERE dc.year = $1`,
      [year]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Data Tahun ${year}`);

    worksheet.columns = [
      { header: "Kode", key: "code", width: 15 },
      { header: "Nama Indikator", key: "indicator_name", width: 30 },
      { header: "Kategori", key: "category", width: 20 },
      { header: "Lensa", key: "lens_category", width: 20 },
      { header: "Tahun", key: "year", width: 10 },
      { header: "Nilai / Penjelasan", key: "value", width: 40 },
      { header: "Link Bukti", key: "evidence_url", width: 30 },
      { header: "Path Dokumen", key: "document_path", width: 30 },
    ];

    // Isi data
    rows.forEach((row) => {
      worksheet.addRow({
        code: row.code,
        indicator_name: row.indicator_name,
        category: row.category,
        lens_category: row.lens_category,
        year: row.year,
        value: row.value,
        evidence_url: row.evidence_url,
        document_path: row.document_path,
      });
    });

    // Response Excel
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=data-collection-${year}.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Gagal export Excel:", err);
    res.status(500).json({ message: "Gagal export data ke Excel" });
  }
};
