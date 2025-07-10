import pool from "../config/db.js";
import { Parser } from "json2csv";
import { Readable } from "stream";

// get all indicators
export const getAllIndikator = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', s.subindicator_id,
          'name', s.name,
          'description', s.description
        )
      ) FILTER (WHERE s.subindicator_id IS NOT NULL), '[]') AS subindikator
      FROM indicators i
      LEFT JOIN subindicators s ON s.indicator_id = i.indicator_id
      GROUP BY i.indicator_id
      ORDER BY i.indicator_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get indicator by code
export const getIndikatorByKode = async (req, res) => {
  try {
    const { kode } = req.params;
    const result = await pool.query(`
      SELECT i.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', s.subindicator_id,
          'name', s.name,
          'description', s.description
        )
      ) FILTER (WHERE s.subindicator_id IS NOT NULL), '[]') AS subindikator
      FROM indicators i
      LEFT JOIN subindicators s ON s.indicator_id = i.indicator_id
      WHERE i.code = $1
      GROUP BY i.indicator_id
    `, [kode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Indikator tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// create indicator
export const createIndikator = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      category,
      lens_category,
      weight,
      source_data,
      is_active,
      subindikator,
    } = req.body;

    const insert = await pool.query(`
      INSERT INTO indicators
      (code, name, description, category, lens_category, weight, source_data, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING indicator_id
    `, [
      code,
      name,
      description,
      category,
      lens_category,
      weight,
      source_data,
      is_active ?? true
    ]);

    const indicatorId = insert.rows[0].indicator_id;

    if (subindikator && subindikator.length > 0) {
      for (const sub of subindikator) {
        await pool.query(`
          INSERT INTO subindicators (indicator_id, name, description)
          VALUES ($1,$2,$3)
        `, [indicatorId, sub.name, sub.description || null]);
      }
    }

    res.status(201).json({ message: "Indikator berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update indicator
export const updateIndikator = async (req, res) => {
  try {
    const { kode } = req.params;
    const {
      name,
      description,
      category,
      lens_category,
      weight,
      source_data,
      is_active,
      subindikator,
      external_link,
    } = req.body;

    const existing = await pool.query(`SELECT * FROM indicators WHERE code=$1`, [kode]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Indikator tidak ditemukan" });
    }

    const indicatorId = existing.rows[0].indicator_id;

    await pool.query(`
  UPDATE indicators SET
    name=$1,
    description=$2,
    category=$3,
    lens_category=$4,
    weight=$5,
    source_data=$6,
    is_active=$7,
    external_link=$8
  WHERE code=$9
`, [
  name,
  description,
  category,
  lens_category,
  weight,
  source_data,
  is_active,
  external_link,
  kode
]);


    await pool.query(`DELETE FROM subindicators WHERE indicator_id=$1`, [indicatorId]);

    if (subindikator && subindikator.length > 0) {
      for (const sub of subindikator) {
        await pool.query(`
          INSERT INTO subindicators (indicator_id, name, description)
          VALUES ($1,$2,$3)
        `, [indicatorId, sub.name, sub.description || null]);
      }
    }

    res.json({ message: "Indikator berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete indicator
export const deleteIndikator = async (req, res) => {
  try {
    const { kode } = req.params;
    const existing = await pool.query(`SELECT * FROM indicators WHERE code=$1`, [kode]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Indikator tidak ditemukan" });
    }

    const indicatorId = existing.rows[0].indicator_id;

    await pool.query(`DELETE FROM subindicators WHERE indicator_id=$1`, [indicatorId]);
    await pool.query(`DELETE FROM indicators WHERE indicator_id=$1`, [indicatorId]);

    res.json({ message: "Indikator berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const getIndikatorSummary = async (req, res) => {
  try {
    const totalResult = await pool.query(`
      SELECT COUNT(*) FROM indicators
      WHERE source_data = 'Institusi'
    `);

    const filledResult = await pool.query(`
      SELECT COUNT(DISTINCT i.indicator_id)
      FROM indicators i
      LEFT JOIN data_collection dc ON i.indicator_id = dc.indicator_id AND dc.year = 2025
      WHERE i.source_data = 'Institusi' AND dc.indicator_id IS NOT NULL
    `);

    const unfilledResult = await pool.query(`
  SELECT code, name FROM indicators
  WHERE source_data = 'Institusi'
    AND is_active = true
    AND indicator_id NOT IN (
      SELECT DISTINCT indicator_id FROM data_collection WHERE year = 2025
    )
`);


    const total = parseInt(totalResult.rows[0].count);
    const filled = parseInt(filledResult.rows[0].count);
    const unfilled = unfilledResult.rows.map(i => `${i.code}: ${i.name}`);

    res.json({ total, filled, unfilled });
  } catch (err) {
    console.error("Gagal ambil summary indikator:", err);
    res.status(500).json({ message: "Gagal ambil ringkasan indikator" });
  }
};


export const getLensSummary = async (req, res) => {
  try {
    const year = 2025; // bisa disesuaikan atau ambil dari query param

    const result = await pool.query(`
      SELECT 
        i.lens_category AS lens,
        i.category AS kategori,
        COUNT(i.indicator_id) AS total,
        COUNT(dc.indicator_id) AS filled,
        MAX(dc.updated_at) AS last_update
      FROM indicators i
      LEFT JOIN data_collection dc 
        ON dc.indicator_id = i.indicator_id AND dc.year = $1
      WHERE i.is_active = true
      GROUP BY i.lens_category, i.category
      ORDER BY i.lens_category
    `, [year]);

    const data = result.rows.map(row => {
      const filled = parseInt(row.filled);
      const total = parseInt(row.total);
      let status = "Not Started";
      if (filled === total) status = "Completed";
      else if (filled > 0) status = "In Progress";

      return {
        kategori: row.kategori,
        lens: row.lens,
        progress: `${filled}/${total} indicators`,
        status,
        lastUpdate: row.last_update 
          ? new Date(row.last_update).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : "-",
      };
    });

    res.json(data);
  } catch (err) {
    console.error("Gagal ambil lens summary:", err);
    res.status(500).json({ message: "Gagal ambil data ringkasan lensa" });
  }
};

export const getLensSummaryInstitusi = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || 2025;

    const result = await pool.query(`
      SELECT 
        i.lens_category AS lens,
        i.category AS kategori,
        COUNT(i.indicator_id) AS total,
        COUNT(dc.indicator_id) AS filled,
        MAX(dc.updated_at) AS last_update
      FROM indicators i
      LEFT JOIN data_collection dc 
        ON dc.indicator_id = i.indicator_id AND dc.year = $1
      WHERE i.is_active = true AND i.source_data = 'Institusi'
      GROUP BY i.lens_category, i.category
      ORDER BY i.lens_category
    `, [year]);

    const data = result.rows.map(row => {
      const filled = parseInt(row.filled);
      const total = parseInt(row.total);
      let status = "Not Started";
      if (filled === total) status = "Completed";
      else if (filled > 0) status = "In Progress";

      return {
        kategori: row.kategori,
        lens: row.lens,
        progress: `${filled}/${total} indicators`,
        status,
        lastUpdate: row.last_update 
          ? new Date(row.last_update).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : "-",
      };
    });

    res.json(data);
  } catch (err) {
    console.error("Gagal ambil lens summary institusi:", err);
    res.status(500).json({ message: "Gagal ambil data ringkasan lensa institusi" });
  }
};




export const exportIndikatorCSV = async (req, res) => {
  const year = parseInt(req.query.year) || 2025;

  try {
    const result = await pool.query(`
      SELECT 
        i.category,
        i.lens_category AS lens,
        i.name,
        i.code,
        i.weight,
        COALESCE(dc.value, '') AS penjelasan,
        COALESCE(dc.evidence_url, '') AS link_bukti
      FROM indicators i
      LEFT JOIN data_collection dc
        ON i.indicator_id = dc.indicator_id AND dc.year = $1
      WHERE i.is_active = true
      ORDER BY i.lens_category, i.category, i.code
    `, [year]);

    const fields = [
      { label: "Category", value: "category" },
      { label: "Lens", value: "lens" },
      { label: "Name", value: "name" },
      { label: "Code", value: "code" },
      { label: "Weight", value: "weight" },
      { label: "Penjelasan", value: "penjelasan" },
      { label: "Link Bukti", value: "link_bukti" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`indikator_qssr_${year}.csv`);

    const stream = Readable.from([csv]);
    stream.pipe(res);
  } catch (err) {
    console.error("Gagal export indikator CSV:", err);
    res.status(500).json({ message: "Gagal export indikator" });
  }
};


import ExcelJS from "exceljs";

export const exportIndikatorExcel = async (req, res) => {
  const year = parseInt(req.query.year) || 2025;

  try {
    const result = await pool.query(`
      SELECT 
        i.category,
        i.lens_category AS lens,
        i.name,
        i.code,
        i.weight,
        COALESCE(dc.value, '') AS penjelasan,
        COALESCE(dc.evidence_url, '') AS link_bukti
      FROM indicators i
      LEFT JOIN data_collection dc
        ON i.indicator_id = dc.indicator_id AND dc.year = $1
      WHERE i.is_active = true
      ORDER BY i.lens_category, i.category, i.code
    `, [year]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Indikator QSSR");

    // Header
    worksheet.columns = [
      { header: "Category", key: "category", width: 20 },
      { header: "Lens", key: "lens", width: 20 },
      { header: "Name", key: "name", width: 40 },
      { header: "Code", key: "code", width: 15 },
      { header: "Weight", key: "weight", width: 10 },
      { header: "Penjelasan", key: "penjelasan", width: 50 },
      { header: "Link Bukti", key: "link_bukti", width: 40 },
    ];

    // Rows
    result.rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=indikator_qssr_${year}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Gagal export Excel:", err);
    res.status(500).json({ message: "Gagal export ke Excel" });
  }
};
