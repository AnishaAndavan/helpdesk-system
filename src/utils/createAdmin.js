const pool = require("../config/db");
const bcrypt = require("bcrypt");

(async () => {
  try {
    const email = "admin@example.com"; 
    const plainPassword = "admin123";  
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin", email, hashedPassword, "admin"]
      );
      console.log("✅ Admin user created successfully!");
    } else {
      await pool.query(
        "UPDATE users SET password = ?, role = ? WHERE email = ?",
        [hashedPassword, "admin", email]
      );
      console.log("🔄 Admin user updated successfully!");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
