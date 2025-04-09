DROP DATABASE IF EXISTS strive;
CREATE DATABASE strive;
USE strive;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    country_code VARCHAR(5),
    role ENUM('CUSTOMER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories (with self-referencing parent_id)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    parent_id INT DEFAULT NULL,
    image_data LONGBLOB,
    image_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Product Images
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Sizes (per product)
CREATE TABLE sizes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(50) NOT NULL,
    UNIQUE (product_id, size),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Stock per size
CREATE TABLE stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    size_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE
);

-- Reviews (per product and user)
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(25) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(25) NOT NULL,
    state VARCHAR(25),
    postal_code VARCHAR(25),
    country VARCHAR(25) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notification_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    order_updates BOOLEAN DEFAULT TRUE,
    promotions BOOLEAN DEFAULT FALSE,
    newsletter BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- Passwords: '123456'

INSERT INTO users (email, password, first_name, last_name, phone, country_code, role) VALUES
('admin@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Admin', 'User', null , null , 'ADMIN'),
('manager@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Manager', 'User', null , null , 'MANAGER'),
('john@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'John', 'Doe', null , null , 'CUSTOMER'),
('jane@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Jane', 'Smith', '555 111 22 33' , '+90', 'CUSTOMER');

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, email_notifications, order_updates, promotions, newsletter) VALUES
(1, TRUE, TRUE, FALSE, TRUE),  -- Admin
(2, TRUE, TRUE, FALSE, TRUE),  -- Manager
(3, TRUE, TRUE, FALSE, TRUE),  -- John
(4, TRUE, TRUE, FALSE, TRUE);  -- Jane

INSERT INTO categories (name, parent_id, image_data, image_type) VALUES
('Men', NULL, NULL, NULL),
('Women', NULL, NULL, NULL),
('Sports', NULL, NULL, NULL),
('Outdoor', NULL, NULL, NULL),
-- Men's Subcategories
('Men''s Clothing', 1, NULL, NULL),
('Men''s Footwear', 1, NULL, NULL),
('Men''s Accessories', 1, NULL, NULL),
('Men''s T-Shirts', 5, NULL, NULL),
('Men''s Jackets', 5, NULL, NULL),
('Men''s Running Shoes', 6, NULL, NULL),
('Men''s Hiking Boots', 6, NULL, NULL),
('Men''s Watches', 7, NULL, NULL),
('Men''s Hats', 7, NULL, NULL),
-- Women's Subcategories
('Women''s Clothing', 2, NULL, NULL),
('Women''s Footwear', 2, NULL, NULL),
('Women''s Accessories', 2, NULL, NULL),
('Women''s Dresses', 11, NULL, NULL),
('Women''s Tops', 11, NULL, NULL),
('Women''s Running Shoes', 12, NULL, NULL),
('Women''s Sandals', 12, NULL, NULL),
('Women''s Jewelry', 13, NULL, NULL),
('Women''s Bags', 13, NULL, NULL),
-- Sports Subcategories
('Team Sports', 3, NULL, NULL),
('Individual Sports', 3, NULL, NULL),
('Fitness', 3, NULL, NULL),
('Running', 3, NULL, NULL),
('Yoga', 3, NULL, NULL),
('Soccer', 17, NULL, NULL),
('Basketball', 17, NULL, NULL),
('Tennis', 18, NULL, NULL),
('Golf', 18, NULL, NULL),
('Gym Equipment', 19, NULL, NULL),
('Fitness Apparel', 19, NULL, NULL),
-- Outdoor Subcategories
('Camping & Hiking', 4, NULL, NULL),
('Cycling', 4, NULL, NULL),
('Water Sports', 4, NULL, NULL),
('Winter Sports', 4, NULL, NULL),
('Tents', 25, NULL, NULL),
('Backpacks', 25, NULL, NULL),
('Mountain Bikes', 26, NULL, NULL),
('Road Bikes', 26, NULL, NULL),
('Swimming', 27, NULL, NULL),
('Kayaking', 27, NULL, NULL),
('Skiing', 28, NULL, NULL),
('Snowboarding', 28, NULL, NULL);

INSERT INTO products (name, description, price, category_id) VALUES
('Smartphone', 'A high-end smartphone with a sleek design and powerful features.', 699.99, 1),
('Science Fiction Novel', 'An exciting science fiction novel that takes you on an interstellar journey.', 19.99, 2),
('T-Shirt', 'A comfortable cotton t-shirt available in various sizes.', 9.99, 3);

INSERT INTO addresses (user_id, name, street_address, city, state, postal_code, country) VALUES
(4, 'Home', '123 Main Street', 'Istanbul', 'Istanbul', '34000', 'Turkey'),
(4, 'Work', '456 Business Avenue', 'Istanbul', 'Istanbul', '34000', 'Turkey');