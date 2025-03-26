DROP DATABASE IF EXISTS strive;
CREATE DATABASE strive;
USE strive;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed passwords will be stored
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Passwords: '123456'

INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('admin@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Admin', 'User', '+1234567890', 'ADMIN'),
('manager@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Manager', 'User', '+1234567893', 'MANAGER'),
('john@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'John', 'Doe', '+1234567891', 'CUSTOMER'),
('jane@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Jane', 'Smith', '+1234567892', 'CUSTOMER')