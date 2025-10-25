const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE user_id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET role = 'Admin' WHERE user_id = ?", [id]);
    res.json({ message: "User promoted to Admin" });
  } catch (err) {
    console.error("promoteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllTechnicians = async (req, res) => {
  try {
    const [technicians] = await pool.query(
      "SELECT user_id, name FROM users WHERE role = 'Technician'"
    );
    res.json(technicians);
  } catch (err) {
    console.error("Error fetching technicians:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
  promoteUser,
  getAllTechnicians
};
