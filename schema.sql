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

-- Featured Categories
CREATE TABLE featured_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    display_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CHECK (display_order BETWEEN 1 AND 6)
);

-- Promotional Banners
CREATE TABLE promotional_banners (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    title VARCHAR(50) NOT NULL,
    subtitle VARCHAR(100) NOT NULL,
    highlight VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    background_color VARCHAR(20) NOT NULL,
    display_order INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Featured Products
CREATE TABLE featured_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    display_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Images
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_data LONGBLOB NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Stock per product
CREATE TABLE stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (product_id, size),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
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
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(25) NOT NULL,
    state VARCHAR(25),
    postal_code VARCHAR(25),
    country VARCHAR(25) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
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

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    card_last_four VARCHAR(4),
    card_expiry VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- Order Items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    size VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Financial metrics table
CREATE TABLE financial_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    daily_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    orders_count INT NOT NULL DEFAULT 0,
    average_order_value DECIMAL(10,2) AS (CASE WHEN orders_count > 0 THEN daily_revenue / orders_count ELSE 0 END) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- Transaction records for individual financial events
CREATE TABLE financial_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    transaction_type ENUM('ORDER', 'REFUND') NOT NULL DEFAULT 'ORDER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Passwords: '123456'

INSERT INTO users (email, password, first_name, last_name, phone, country_code, role) VALUES
('admin@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Admin', 'User', null , null , 'ADMIN'),
('manager@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Manager', 'User', null , null , 'MANAGER'),
('john@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'John', 'Doe', null , null , 'CUSTOMER'),
('jane@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Jane', 'Smith', '555 111 22 33' , '+90', 'CUSTOMER');

-- Insert initial promotional banners
INSERT INTO promotional_banners (title, subtitle, highlight, icon, background_color, display_order, active) VALUES
('FAST DELIVERY!', 'ORDER NOW IN NEW YORK,', 'GET IT IN 3 HOURS!', 'LocalShippingOutlined', '#4051B5', 1, TRUE),
('SPECIAL OFFER!', 'GET 20% OFF', 'ON ALL SPORTS EQUIPMENT', 'LocalOfferOutlined', '#2E7D32', 2, TRUE),
('NEW COLLECTION!', 'DISCOVER OUR', 'SUMMER 2024 COLLECTION', 'NewReleasesOutlined', '#C2185B', 3, TRUE),
('MEMBERS ONLY!', 'JOIN OUR CLUB AND GET', 'EXCLUSIVE BENEFITS', 'CardMembershipOutlined', '#F57C00', 4, TRUE),
('FREE RETURNS!', 'TRY AT HOME WITH', '30-DAY FREE RETURNS', 'AssignmentReturnOutlined', '#0097A7', 5, TRUE);

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, email_notifications, order_updates, promotions, newsletter) VALUES
(1, TRUE, TRUE, FALSE, TRUE),  -- Admin
(2, TRUE, TRUE, FALSE, TRUE),  -- Manager
(3, TRUE, TRUE, FALSE, TRUE),  -- John
(4, TRUE, TRUE, FALSE, TRUE);  -- Jane

INSERT INTO categories (name, parent_id, image_data, image_type) VALUES
-- Main Categories
('Men', NULL, NULL, NULL),
('Women', NULL, NULL, NULL),
('Sports', NULL, NULL, NULL),
('Outdoor', NULL, NULL, NULL),

-- Men's Subcategories
('Men''s Clothing', 1, NULL, NULL),
('Men''s Footwear', 1, NULL, NULL),
('Men''s Accessories', 1, NULL, NULL),

-- Men's Clothing subcategories
('Men''s T-Shirts', 5, NULL, NULL),
('Men''s Jackets', 5, NULL, NULL),

-- Men's Footwear subcategories
('Men''s Running Shoes', 6, NULL, NULL),
('Men''s Hiking Boots', 6, NULL, NULL),

-- Men's Accessories subcategories
('Men''s Watches', 7, NULL, NULL),
('Men''s Hats', 7, NULL, NULL),

-- Women's Subcategories
('Women''s Clothing', 2, NULL, NULL),
('Women''s Footwear', 2, NULL, NULL),
('Women''s Accessories', 2, NULL, NULL),

-- Women's Clothing subcategories
('Women''s Dresses', 14, NULL, NULL),
('Women''s Tops', 14, NULL, NULL),

-- Women's Footwear subcategories
('Women''s Running Shoes', 15, NULL, NULL),
('Women''s Sandals', 15, NULL, NULL),

-- Women's Accessories subcategories
('Women''s Jewelry', 16, NULL, NULL),
('Women''s Bags', 16, NULL, NULL),

-- Sports Subcategories
('Team Sports', 3, NULL, NULL),
('Individual Sports', 3, NULL, NULL),
('Fitness', 3, NULL, NULL),
('Running', 3, NULL, NULL),
('Yoga', 3, NULL, NULL),

-- Team Sports subcategories
('Soccer', 23, NULL, NULL),
('Basketball', 23, NULL, NULL),

-- Individual Sports subcategories
('Tennis', 24, NULL, NULL),
('Golf', 24, NULL, NULL),

-- Fitness subcategories
('Gym Equipment', 25, NULL, NULL),
('Fitness Apparel', 25, NULL, NULL),

-- Outdoor Subcategories
('Camping & Hiking', 4, NULL, NULL),
('Cycling', 4, NULL, NULL),
('Water Sports', 4, NULL, NULL),
('Winter Sports', 4, NULL, NULL),

-- Camping & Hiking subcategories
('Tents', 34, NULL, NULL),
('Backpacks', 34, NULL, NULL),

-- Cycling subcategories
('Mountain Bikes', 35, NULL, NULL),
('Road Bikes', 35, NULL, NULL),

-- Water Sports subcategories
('Swimming', 36, NULL, NULL),
('Kayaking', 36, NULL, NULL),

-- Winter Sports subcategories
('Skiing', 37, NULL, NULL),
('Snowboarding', 37, NULL, NULL);

INSERT INTO featured_categories (category_id, display_order) VALUES
(9, 1),   -- Men's Jacekts
(6, 2),   -- Men's Footwear
(4, 3),   -- Outdoor
(37, 4),  -- Winter Sports
(34, 5),  -- Backpacks
(36, 6);  -- Water Sports

INSERT INTO products (name, description, price, category_id) VALUES
-- Men's T-Shirts (category_id: 8)
('Classic Cotton T-Shirt', 'Comfortable 100% cotton basic t-shirt perfect for everyday wear', 29.99, 8),
('Performance Sport T-Shirt', 'Moisture-wicking fabric ideal for workouts and sports activities', 34.99, 8),
('Striped Polo Shirt', 'Classic striped polo shirt made from premium cotton blend', 45.99, 8),

-- Men's Jackets (category_id: 9)
('Winter Puffer Jacket', 'Warm and comfortable puffer jacket with water-resistant exterior', 129.99, 9),
('Leather Bomber Jacket', 'Classic leather bomber jacket with premium quality leather', 199.99, 9),
('Waterproof Rain Jacket', 'Lightweight and packable rain jacket with sealed seams', 89.99, 9),

-- Men's Running Shoes (category_id: 10)
('Speed Runner Pro', 'Professional running shoes with advanced cushioning technology', 159.99, 10),
('Daily Trainer X1', 'Comfortable everyday running shoes for regular training', 129.99, 10),
('Marathon Elite', 'Long-distance running shoes with superior support', 179.99, 10),

-- Women's Dresses (category_id: 17)
('Summer Floral Dress', 'Light and breezy floral print dress perfect for summer', 79.99, 17),
('Little Black Dress', 'Classic black cocktail dress for special occasions', 119.99, 17),
('Maxi Beach Dress', 'Long flowing beach dress with tropical print', 89.99, 17),

-- Women's Running Shoes (category_id: 19)
('Women\'s Cloud Runner', 'Lightweight running shoes with cloud-like cushioning', 149.99, 19),
('Women\'s Trail Beast', 'Rugged trail running shoes with excellent grip', 159.99, 19),
('Women\'s Sprint Elite', 'Speed-focused running shoes for race day', 169.99, 19),

-- Camping & Hiking (category_id: 34)
('Explorer 4-Person Tent', 'Spacious 4-person tent with weather protection', 299.99, 34),
('Lightweight Hiking Backpack', '45L hiking backpack with multiple compartments', 149.99, 34),
('Camping Sleep System', 'All-season sleeping bag with camping pad', 199.99, 34),

-- Winter Sports - Skiing (category_id: 42)
('All-Mountain Skis', 'Versatile skis for all terrain conditions', 499.99, 42),
('Professional Ski Boots', 'High-performance ski boots with custom fit', 399.99, 42),
('Ski Helmet Pro', 'Safety certified ski helmet with adjustable ventilation', 159.99, 42),

-- Water Sports - Swimming (category_id: 40)
('Competition Swimsuit', 'Professional racing swimsuit with hydrodynamic design', 89.99, 40),
('Swimming Goggles Elite', 'Anti-fog swimming goggles with UV protection', 34.99, 40),
('Swim Training Set', 'Complete set including fins, paddles, and pull buoy', 79.99, 40),

-- Fitness Equipment (category_id: 31)
('Adjustable Dumbbell Set', 'Space-saving adjustable dumbbells from 5-52.5 lbs', 299.99, 31),
('Yoga Mat Premium', 'Extra thick eco-friendly yoga mat with alignment lines', 49.99, 31),
('Resistance Bands Set', 'Complete set of resistance bands with different strengths', 29.99, 31),

-- Cycling - Mountain Bikes (category_id: 38)
('Trail Master Pro Bike', 'Full suspension mountain bike with premium components', 1999.99, 38),
('Mountain Bike Helmet', 'Ventilated mountain bike helmet with adjustable fit', 89.99, 38),
('Bike Repair Kit', 'Complete tool kit for mountain bike maintenance', 49.99, 38);

INSERT INTO addresses (user_id, name, recipient_name, recipient_phone, street_address, city, state, postal_code, country, is_default) VALUES
(4, 'Home', 'John Doe', '555 111 22 33', '123 Main Street', 'Istanbul', 'Istanbul', '34000', 'Turkey', true),
(4, 'Work', 'Jane Smith', '555 444 55 66', '456 Business Avenue', 'Istanbul', 'Istanbul', '34000', 'Turkey', false);

INSERT INTO featured_products (product_id, display_order) VALUES
(2, 1),
(16, 2),
(17, 3),
(28, 4),
(30, 5);

-- Stocks for Performance Sport T-Shirt
INSERT INTO stocks (product_id, size, quantity) VALUES
(2, 'XS', 25),
(2, 'S', 40),
(2, 'M', 50),
(2, 'L', 45),
(2, 'XL', 30),
(2, 'XXL', 2);

-- Stocks for Explorer 4-Person Tent
INSERT INTO stocks (product_id, size, quantity) VALUES
(16, 'ONE SIZE', 15);

-- Stocks for Lightweight Hiking Backpack
INSERT INTO stocks (product_id, size, quantity) VALUES
(17, '45L', 25);

-- Stocks for Trail Master Pro Bike
INSERT INTO stocks (product_id, size, quantity) VALUES
(28, 'S (15")', 8),
(28, 'M (17")', 12),
(28, 'L (19")', 10),
(28, 'XL (21")', 6);

-- Stocks for Bike Repair Kit
INSERT INTO stocks (product_id, size, quantity) VALUES
(30, 'ONE SIZE', 35);

-- Reviews for Performance Sport T-Shirt
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(2, 3, 5, 'Perfect for my morning runs! The moisture-wicking really works.'),
(2, 4, 4, 'Good quality shirt, fits as expected. Would buy again.'),
(2, 2, 5, 'Great performance during intense workouts. Highly recommend!');

-- Reviews for Explorer 4-Person Tent
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(16, 3, 5, 'Spacious and easy to set up. Perfect for family camping!'),
(16, 4, 4, 'Good weather protection, survived a rainy weekend.'),
(16, 2, 5, 'Excellent quality tent, worth every penny.');

-- Reviews for Lightweight Hiking Backpack
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(17, 3, 4, 'Comfortable for long hikes, lots of useful compartments'),
(17, 4, 5, 'Perfect size for weekend trips, very durable'),
(17, 2, 4, 'Good organization and comfortable straps');

-- Reviews for Trail Master Pro Bike
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(28, 3, 1, 'Amazing bike! Handles trails perfectly'),
(28, 4, 2, 'Professional quality, smooth riding experience'),
(28, 2, 3, 'Great components, though a bit pricey');

-- Reviews for Bike Repair Kit
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(30, 3, 4, 'Has all the essential tools needed for basic repairs'),
(30, 4, 5, 'Compact and comprehensive kit, saved me multiple times'),
(30, 2, 4, 'Good quality tools, convenient carrying case');

-- Sample Orders for Financial Data - ordered by date with newest orders having highest IDs
INSERT INTO orders (id, user_id, address_id, total_amount, status, payment_method, payment_status, created_at) VALUES
(22, 3, 1, 209.97, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 1 DAY),
(21, 4, 1, 179.98, 'DELIVERED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 1 DAY + INTERVAL 2 HOUR),
(20, 4, 1, 379.98, 'DELIVERED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 3 DAY),
(19, 3, 1, 259.99, 'SHIPPED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 5 DAY),
(18, 3, 1, 499.99, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 7 DAY),
(17, 4, 1, 329.99, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 9 DAY),
(16, 4, 1, 149.99, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 14 DAY),
(15, 3, 1, 229.98, 'SHIPPED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 16 DAY),
(14, 3, 1, 299.98, 'SHIPPED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 25 DAY),
(13, 4, 1, 699.97, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 32 DAY),
(12, 3, 1, 199.99, 'PROCESSING', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 45 DAY),
(11, 3, 1, 89.99, 'DELIVERED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 55 DAY),
(10, 4, 1, 249.98, 'SHIPPED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 70 DAY),
(9, 3, 1, 129.99, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 80 DAY),
(8, 4, 1, 459.97, 'PROCESSING', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 95 DAY),
(7, 3, 1, 89.99, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 110 DAY),
(6, 4, 1, 339.98, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 125 DAY),
(5, 3, 1, 159.99, 'SHIPPED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 140 DAY),
(4, 4, 1, 549.98, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 160 DAY),
(3, 3, 1, 179.99, 'DELIVERED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 175 DAY),
(2, 4, 1, 239.98, 'DELIVERED', 'PAYPAL', 'COMPLETED', CURRENT_DATE() - INTERVAL 185 DAY),
(1, 3, 1, 419.99, 'SHIPPED', 'CREDIT_CARD', 'COMPLETED', CURRENT_DATE() - INTERVAL 200 DAY);

-- Update the order items for the additional orders - adjust IDs to match new order IDs
INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES
(22, 2, 1, 'M', 34.99),
(22, 3, 1, 'L', 45.99),
(22, 9, 1, '42', 129.99),
(21, 11, 1, 'S', 119.99),
(21, 15, 1, '39', 59.99),
(20, 16, 1, 'ONE SIZE', 299.99),
(20, 25, 1, 'ONE SIZE', 79.99),
(19, 4, 1, 'XL', 129.99),
(19, 6, 1, 'L', 129.99),
(18, 19, 1, 'L', 499.99),
(17, 8, 1, '42', 149.99),
(17, 24, 1, 'ONE SIZE', 179.99),
(16, 17, 1, '45L', 149.99),
(15, 5, 1, 'M', 179.99),
(15, 21, 1, 'ONE SIZE', 49.99),
(14, 8, 1, '40', 129.99),
(14, 12, 1, 'M', 169.99),
(13, 28, 1, 'M (17")', 699.97),
(12, 5, 1, 'L', 199.99),
(11, 6, 1, 'M', 89.99),
(10, 30, 1, 'ONE SIZE', 49.99),
(10, 26, 1, 'ONE SIZE', 199.99),
(9, 4, 1, 'XL', 129.99),
(8, 7, 1, '43', 159.99),
(8, 11, 1, 'S', 119.99),
(8, 13, 1, '39', 179.99),
(7, 6, 1, 'L', 89.99),
(6, 21, 1, 'ONE SIZE', 159.99),
(6, 24, 1, 'ONE SIZE', 179.99),
(5, 8, 1, '41', 159.99),
(4, 19, 1, 'L', 549.98),
(3, 26, 1, 'ONE SIZE', 179.99),
(2, 7, 1, '42', 129.99),
(2, 30, 1, 'ONE SIZE', 109.99),
(1, 18, 1, 'S', 229.99),
(1, 27, 1, 'M', 189.99);

-- Weekly aggregated Financial Metrics Sample Data
INSERT INTO financial_metrics (date, daily_revenue, orders_count) VALUES
-- Current week
(CURRENT_DATE() - INTERVAL 1 DAY, 389.95, 2),
(CURRENT_DATE() - INTERVAL 3 DAY, 379.98, 1),
(CURRENT_DATE() - INTERVAL 5 DAY, 259.99, 1),
(CURRENT_DATE() - INTERVAL 7 DAY, 499.99, 1),
-- Last week
(CURRENT_DATE() - INTERVAL 9 DAY, 329.99, 1),
(CURRENT_DATE() - INTERVAL 14 DAY, 149.99, 1),
(CURRENT_DATE() - INTERVAL 16 DAY, 229.98, 1),
-- Two weeks ago
(CURRENT_DATE() - INTERVAL 25 DAY, 299.98, 1),
-- Three weeks ago
(CURRENT_DATE() - INTERVAL 32 DAY, 699.97, 1),
-- Four weeks ago
(CURRENT_DATE() - INTERVAL 45 DAY, 199.99, 1),
-- Other weeks
(CURRENT_DATE() - INTERVAL 55 DAY, 89.99, 1),
(CURRENT_DATE() - INTERVAL 70 DAY, 249.98, 1),
(CURRENT_DATE() - INTERVAL 80 DAY, 129.99, 1),
(CURRENT_DATE() - INTERVAL 95 DAY, 459.97, 1),
(CURRENT_DATE() - INTERVAL 110 DAY, 89.99, 1),
(CURRENT_DATE() - INTERVAL 125 DAY, 339.98, 1),
(CURRENT_DATE() - INTERVAL 140 DAY, 159.99, 1),
(CURRENT_DATE() - INTERVAL 160 DAY, 549.98, 1),
(CURRENT_DATE() - INTERVAL 175 DAY, 179.99, 1),
(CURRENT_DATE() - INTERVAL 185 DAY, 239.98, 1),
(CURRENT_DATE() - INTERVAL 200 DAY, 419.99, 1);

-- Financial Transactions Sample Data - Order IDs match the new ordering
INSERT INTO financial_transactions (order_id, amount, description, transaction_type, created_at) VALUES
(22, 209.97, 'Order #22', 'ORDER', CURRENT_DATE() - INTERVAL 1 DAY),
(21, 179.98, 'Order #21', 'ORDER', CURRENT_DATE() - INTERVAL 1 DAY + INTERVAL 2 HOUR),
(20, 379.98, 'Order #20', 'ORDER', CURRENT_DATE() - INTERVAL 3 DAY),
(19, 259.99, 'Order #19', 'ORDER', CURRENT_DATE() - INTERVAL 5 DAY),
(18, 499.99, 'Order #18', 'ORDER', CURRENT_DATE() - INTERVAL 7 DAY),
(17, 329.99, 'Order #17', 'ORDER', CURRENT_DATE() - INTERVAL 9 DAY),
(16, 149.99, 'Order #16', 'ORDER', CURRENT_DATE() - INTERVAL 14 DAY),
(15, 229.98, 'Order #15', 'ORDER', CURRENT_DATE() - INTERVAL 16 DAY),
(14, 299.98, 'Order #14', 'ORDER', CURRENT_DATE() - INTERVAL 25 DAY),
(13, 699.97, 'Order #13', 'ORDER', CURRENT_DATE() - INTERVAL 32 DAY),
(12, 199.99, 'Order #12', 'ORDER', CURRENT_DATE() - INTERVAL 45 DAY),
(11, 89.99, 'Order #11', 'ORDER', CURRENT_DATE() - INTERVAL 55 DAY),
(10, 249.98, 'Order #10', 'ORDER', CURRENT_DATE() - INTERVAL 70 DAY),
(9, 129.99, 'Order #9', 'ORDER', CURRENT_DATE() - INTERVAL 80 DAY),
(8, 459.97, 'Order #8', 'ORDER', CURRENT_DATE() - INTERVAL 95 DAY),
(7, 89.99, 'Order #7', 'ORDER', CURRENT_DATE() - INTERVAL 110 DAY),
(6, 339.98, 'Order #6', 'ORDER', CURRENT_DATE() - INTERVAL 125 DAY),
(5, 159.99, 'Order #5', 'ORDER', CURRENT_DATE() - INTERVAL 140 DAY),
(4, 549.98, 'Order #4', 'ORDER', CURRENT_DATE() - INTERVAL 160 DAY),
(3, 179.99, 'Order #3', 'ORDER', CURRENT_DATE() - INTERVAL 175 DAY),
(2, 239.98, 'Order #2', 'ORDER', CURRENT_DATE() - INTERVAL 185 DAY),
(1, 419.99, 'Order #1', 'ORDER', CURRENT_DATE() - INTERVAL 200 DAY);