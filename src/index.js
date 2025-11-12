const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config({ path: path.join(__dirname, "../.env") });
console.log("DB_HOST:", process.env.MYSQLHOST);
console.log("DB_USER:", process.env.MYSQLUSER);
console.log("DB_NAME:", process.env.MYSQLDATABASE);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/admin");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

const PORT = process.env.MYSQLPORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
