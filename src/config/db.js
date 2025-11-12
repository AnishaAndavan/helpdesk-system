const mysql = require("mysql2/promise");

// ✅ Load .env only in local development, not on Render
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: __dirname + "/../../.env" });
}

console.log("Connecting to MySQL...");
console.log("HOST:", process.env.MYSQLHOST);
console.log("USER:", process.env.MYSQLUSER);
console.log("DATABASE:", process.env.MYSQLDATABASE);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(() => console.log("✅ MySQL database connected successfully"))
  .catch(err => console.error("❌ Database connection failed:", err.message));

module.exports = pool;
