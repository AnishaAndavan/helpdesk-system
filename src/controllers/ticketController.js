const pool = require("../config/db");

const createTicket = async (req, res) => {
  const { subject, description, priority } = req.body;
  const created_by = req.user.id;

  if (!subject || !description || !priority) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO tickets (subject, description, priority, created_by) VALUES (?, ?, ?, ?)",
      [subject, description, priority, created_by]
    );

    res.status(201).json({ message: "Ticket created successfully", ticketId: result.insertId });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getTicketsByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const [tickets] = await pool.query(
      "SELECT * FROM tickets WHERE created_by = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(tickets);
  } catch (err) {
    console.error("Get tickets error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllTicketsForTechnician = async (req, res) => {
  const userId = req.user.id;

  try {
    const [tickets] = await pool.query(
      "SELECT * FROM tickets WHERE assigned_to = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(tickets);
  } catch (err) {
    console.error("Get assigned tickets error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const [result] = await pool.query(
      "UPDATE tickets SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ message: "Ticket status updated successfully" });
  } catch (err) {
    console.error("Update ticket status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const assignTicketToTechnician = async (req, res) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  if (!technicianId) return res.status(400).json({ message: "Technician ID is required" });

  try {
    const [result] = await pool.query(
      "UPDATE tickets SET assigned_to = ?, status = 'Assigned' WHERE id = ?",
      [technicianId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ message: "Ticket assigned successfully" });
  } catch (err) {
    console.error("Assign ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const [tickets] = await pool.query(
      `SELECT t.id, t.subject, t.status, t.priority, t.created_at, 
              u.name AS created_by_name, a.name AS assigned_to_name
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.user_id
       LEFT JOIN users a ON t.assigned_to = a.user_id
       ORDER BY t.created_at DESC`
    );
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching all tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTicketStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
      FROM tickets
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getRecentTickets = async (req, res) => {
  try {
    const [tickets] = await pool.query(`
      SELECT t.id, t.subject, t.status, u.name AS created_by_name, t.created_at
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.user_id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching recent tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTicket,
  getTicketsByUser,
  getAllTicketsForTechnician,
  updateTicketStatus,
  assignTicketToTechnician,
  getAllTickets,
  getTicketStats,
  getRecentTickets
};
