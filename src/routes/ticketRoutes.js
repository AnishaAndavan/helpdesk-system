const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/create", verifyToken, async (req, res) => {
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
    console.error("Error creating ticket:", err);
    res.status(500).json({ message: "Error creating ticket" });
  }
});

router.get("/mytickets", verifyToken, async (req, res) => {
  try {
    const [tickets] = await pool.query(
      "SELECT * FROM tickets WHERE created_by = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching user tickets:", err);
    res.status(500).json({ message: "Error fetching tickets" });
  }
});


router.get("/assigned", verifyToken, async (req, res) => {
  try {
    const [tickets] = await pool.query(
      `SELECT t.id, t.subject, t.description, t.priority, t.status, t.created_at,
              u.name AS employee_name, u.email AS employee_email
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.user_id
       WHERE t.assigned_to = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching assigned tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

   console.log("Incoming update:", { id, status });

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const [result] = await pool.query(
      "UPDATE tickets SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Ticket status updated successfully" });
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/all", verifyToken, async (req, res) => {
  try {
    const [tickets] = await pool.query(`
      SELECT t.id, t.subject, t.status, t.priority, t.created_by, 
             u.name AS created_by_name, t.assigned_to, t.created_at
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.user_id
      ORDER BY t.created_at DESC
    `);
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching all tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/assign/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  if (!technicianId)
    return res.status(400).json({ message: "Technician ID is required" });

  try {
    const [rows] = await pool.query(
      "SELECT assigned_to, status FROM tickets WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Ticket not found" });

    const ticket = rows[0];

    if (ticket.assigned_to && ticket.assigned_to === technicianId) {
      return res
        .status(400)
        .json({ message: "Ticket is already assigned to this technician" });
    }

    if (ticket.status === "In Progress" || ticket.status === "Resolved") {
      return res
        .status(400)
        .json({ message: "Cannot reassign ticket that is in progress or resolved" });
    }

    const [result] = await pool.query(
      "UPDATE tickets SET assigned_to = ?, status = 'Assigned' WHERE id = ?",
      [technicianId, id]
    );

    res.json({ message: "Ticket assigned successfully" });
  } catch (err) {
    console.error("Error assigning ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", verifyToken, async (req, res) => {
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
});

router.get("/recent", verifyToken, async (req, res) => {
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
});



module.exports = router;
