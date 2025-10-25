import pool from "../config/db.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const [[{ totalTickets }]] = await pool.query("SELECT COUNT(*) as totalTickets FROM tickets");
    const [[{ openTickets }]] = await pool.query(
      "SELECT COUNT(*) as openTickets FROM tickets WHERE status='Open'"
    );
    const [[{ closedTickets }]] = await pool.query(
      "SELECT COUNT(*) as closedTickets FROM tickets WHERE status='Closed'"
    );
    const [[{ technicians }]] = await pool.query(
      "SELECT COUNT(*) as technicians FROM users WHERE role='Technician'"
    );

    res.json({ totalTickets, openTickets, closedTickets, technicians });
  } catch (err) {
    console.error("getDashboardOverview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecentTickets = async (req, res) => {
  try {
    const [tickets] = await pool.query(
      "SELECT t.id, t.subject, t.status, u.name as assigned_to, t.created_at FROM tickets t LEFT JOIN users u ON t.assigned_to = u.user_id ORDER BY t.created_at DESC LIMIT 10"
    );
    res.json(tickets);
  } catch (err) {
    console.error("getRecentTickets error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
