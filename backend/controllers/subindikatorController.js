import pool from "../config/db.js";

// get all subindikator
export const getAllSubindikator = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM subindikator ORDER BY id`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get subindikator by id
export const getSubindikatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM subindikator WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subindikator tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// create subindikator
export const createSubindikator = async (req, res) => {
  try {
    const { indikator_kode, nama } = req.body;
    await pool.query(
      `INSERT INTO subindikator (indikator_kode, nama) VALUES ($1, $2)`,
      [indikator_kode, nama]
    );
    res.status(201).json({ message: "Subindikator berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update subindikator
export const updateSubindikator = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    const result = await pool.query(`SELECT * FROM subindikator WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subindikator tidak ditemukan" });
    }

    await pool.query(`UPDATE subindikator SET nama=$1 WHERE id=$2`, [nama, id]);
    res.json({ message: "Subindikator berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete subindikator
export const deleteSubindikator = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`SELECT * FROM subindikator WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subindikator tidak ditemukan" });
    }

    await pool.query(`DELETE FROM subindikator WHERE id=$1`, [id]);
    res.json({ message: "Subindikator berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
