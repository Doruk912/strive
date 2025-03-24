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

-- Original passwords are included as comments:
-- admin@strive.com: password = '123'
-- manager@strive.com: password = '123'
-- john@example.com: password = '123'
-- jane@example.com: password = '123'

INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('admin@strive.com', '$2a$10$Ew/1gdMDiqB1.KRj1HOJNeCWxR9JANm9a8f1z0nCj32bnGHHfLZaO', 'Admin', 'User', '+1234567890', 'ADMIN'),
('manager@strive.com', '$2a$10$pB.4F.oIBGBV4NcLJGYbqu4J1MdAoDYJ6dtNgzIr8wUXnLyKYoN9C', 'Manager', 'User', '+1234567893', 'MANAGER'),
('john@example.com', '$2a$10$2aNM1KPRPdPJd8vyfg/oReGqFqGJOKwJrsrYNVkY6LeQ7QC4jnmtm', 'John', 'Doe', '+1234567891', 'CUSTOMER'),
('jane@example.com', '$2a$10$Iv4OfXAUW8EbFR7cMQA.XuMW0ZMjZWIUEYwE/q/GQqmrGsW6RV6dW', 'Jane', 'Smith', '+1234567892', 'CUSTOMER')