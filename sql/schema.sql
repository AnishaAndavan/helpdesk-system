CREATE DATABASE IF NOT EXISTS helpdesk;
USE helpdesk;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Technician', 'Employee') NOT NULL DEFAULT 'Employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an admin user (password: admin123, hash it later with bcrypt)
INSERT INTO users (name, email, password, role)
VALUES ('System Admin', 'admin@company.com', '$2b$10$g5NrmBYc3OxVdS2G4D0wHeFohOmZ5.Janacpplw1UqQZpBqEM0b1G', 'Admin');

