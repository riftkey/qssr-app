import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = userQuery.rows[0];
  if (!user) {
    return res.status(401).json({ message: "Email tidak ditemukan" });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: "Password salah" });
  }

  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
  token,
  role: user.role,
  username: user.username, // tambahin ini
  message: "Login berhasil"
});

};

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    // cek user sudah ada?
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [username, email, hashedPassword, "user"]
    );

    res.status(201).json({
      message: "Register berhasil",
      user: {
        id: result.rows[0].user_id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
