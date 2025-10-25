
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/overview", verifyToken, async (req, res) => {
  try {
    const [[ticketCounts]] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 'Open') AS open_tickets,
        SUM(status = 'Closed') AS closed_tickets
      FROM tickets
    `);

    const [[technicianCount]] = await pool.query(`
      SELECT COUNT(*) AS technicians
      FROM users
      WHERE role = 'Technician'
    `);

    res.json({
      totalTickets: ticketCounts.total || 0,
      openTickets: ticketCounts.open_tickets || 0,
      closedTickets: ticketCounts.closed_tickets || 0,
      technicians: technicianCount.technicians || 0,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/technicians", verifyToken, async (req, res) => {
  try {
    const [techs] = await pool.query("SELECT user_id, name FROM users WHERE role = 'Technician'");
    res.json(techs);
  } catch (err) {
    console.error("Error fetching technicians:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
