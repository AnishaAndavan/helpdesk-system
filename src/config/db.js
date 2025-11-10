const mysql = require("mysql2/promise");

// ✅ Load .env only in local development, not on Render
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: __dirname + "/../../.env" });
}

console.log("Connecting to MySQL...");
console.log("HOST:", process.env.MYSQLHOST || process.env.DB_HOST);
console.log("USER:", process.env.MYSQLUSER || process.env.DB_USER);
console.log("DATABASE:", process.env.MYSQLDATABASE || process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(() => console.log("✅ MySQL database connected successfully"))
  .catch(err => console.error("❌ Database connection failed:", err.message));

module.exports = pool;
