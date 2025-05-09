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

-- Original addresses table (no changes)
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

-- New table for order addresses - created BEFORE orders table
CREATE TABLE order_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(25),
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(25) NOT NULL,
    state VARCHAR(25),
    postal_code VARCHAR(25),
    country VARCHAR(25) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passwords: '123456'
INSERT INTO users (email, password, first_name, last_name, phone, country_code, role) VALUES
('admin@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Admin', 'User', null , null , 'ADMIN'),
('manager@strive.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Manager', 'User', null , null , 'MANAGER'),
('john@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'John', 'Doe', null , null , 'CUSTOMER'),
('jane@example.com', '$2a$12$KMJjGzb6tX93GDD3djKJueVQpOkOP.iPzEMWRAZGlIimKel5Pw9nm', 'Jane', 'Smith', '555 111 22 33' , '+90', 'CUSTOMER');

INSERT INTO promotional_banners (title, subtitle, highlight, icon, background_color, display_order, active) VALUES
('FAST DELIVERY!', 'ORDER NOW IN NEW YORK,', 'GET IT IN 3 HOURS!', 'LocalShippingOutlined', '#4051B5', 1, TRUE),
('SPECIAL OFFER!', 'GET 20% OFF', 'ON ALL SPORTS EQUIPMENT', 'LocalOfferOutlined', '#2E7D32', 2, TRUE),
('NEW COLLECTION!', 'DISCOVER OUR', 'SUMMER 2024 COLLECTION', 'NewReleasesOutlined', '#C2185B', 3, TRUE),
('MEMBERS ONLY!', 'JOIN OUR CLUB AND GET', 'EXCLUSIVE BENEFITS', 'CardMembershipOutlined', '#F57C00', 4, TRUE),
('FREE RETURNS!', 'TRY AT HOME WITH', '30-DAY FREE RETURNS', 'AssignmentReturnOutlined', '#0097A7', 5, TRUE);

INSERT INTO addresses (user_id, name, recipient_name, recipient_phone, street_address, city, state, postal_code, country, is_default) VALUES
(4, 'Home', 'John Doe', '555 111 22 33', '123 Main Street', 'Istanbul', 'Istanbul', '34000', 'Turkey', true),
(4, 'Work', 'Jane Smith', '555 444 55 66', '456 Business Avenue', 'Istanbul', 'Istanbul', '34000', 'Turkey', false),
(3, 'Home', 'John Doe', '555 111 22 33', '789 Oak Street', 'New York', 'NY', '10001', 'USA', true);

-- Copy all user addresses to order_addresses to support existing orders
INSERT INTO order_addresses (id, name, recipient_name, recipient_phone, street_address, city, state, postal_code, country)
SELECT id, name, recipient_name, recipient_phone, street_address, city, state, postal_code, country 
FROM addresses;

-- Notification preferences
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

-- Orders table (updated foreign key to point to order_addresses)
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
    FOREIGN KEY (address_id) REFERENCES order_addresses(id)
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

-- Password Reset Tokens table
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert notification preferences
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
('Snowboarding', 37, NULL, NULL),

-- Team Sports - Track & Field (Add this as a new category under Individual Sports)
('Track & Field', 24, NULL, NULL);

INSERT INTO featured_categories (category_id, display_order) VALUES
(9, 1),   -- Men's Jacekts
(6, 2),   -- Men's Footwear
(4, 3),   -- Outdoor
(37, 4),  -- Winter Sports
(34, 5),  -- Backpacks
(36, 6);  -- Water Sports

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


-- Men's Clothing - T-Shirts (category_id: 8)
INSERT INTO products (name, description, price, category_id) VALUES
('Premium Cotton Crew Neck T-Shirt - White', 'Soft, breathable cotton t-shirt with a classic fit and reinforced neckline', 34.99, 8),
('Athletic Performance T-Shirt - Heather Grey', 'Moisture-wicking technical fabric with four-way stretch and odor control technology', 39.99, 8);

-- Men's Clothing - Jackets (category_id: 9)
INSERT INTO products (name, description, price, category_id) VALUES
('Alpine Explorer Insulated Jacket', 'Weatherproof insulated jacket with thermal retention technology and adjustable hood', 149.99, 9);

-- Men's Accessories - Hats (category_id: 13)
INSERT INTO products (name, description, price, category_id) VALUES
('Performance Outdoor Baseball Cap', 'Lightweight, quick-drying cap with UV protection and adjustable back closure', 29.99, 13);

-- Men's Accessories - Watches (category_id: 12)
INSERT INTO products (name, description, price, category_id) VALUES
('Expedition Chronograph Sports Watch', 'Multifunctional sports watch with water resistance up to 100m and luminous display', 189.99, 12);

-- Men's Footwear - Running Shoes (category_id: 10)
INSERT INTO products (name, description, price, category_id) VALUES
('Momentum Pro Performance Running Shoes', 'Lightweight running shoes with responsive cushioning and breathable mesh upper', 129.99, 10);

-- Men's Footwear - Hiking Boots (category_id: 11)
INSERT INTO products (name, description, price, category_id) VALUES
('TrailMaster Waterproof Hiking Boots', 'Rugged hiking boots with waterproof membrane and advanced grip technology', 159.99, 11);

-- Men's Clothing (Add to Men's Clothing - category_id: 5)
INSERT INTO products (name, description, price, category_id) VALUES
('Performance Athletic Tracksuit - Navy Blue', 'Breathable tracksuit with moisture-wicking technology and ergonomic design', 89.99, 5),
('Elite Training Tracksuit - Black', 'Premium tracksuit with reflective details and four-way stretch fabric', 99.99, 5);

-- Women's Clothing (Add to Women's Clothing - category_id: 14)
INSERT INTO products (name, description, price, category_id) VALUES
('Active Lifestyle Tracksuit - Ruby Red', 'Stylish tracksuit with quick-dry technology and flattering silhouette', 94.99, 14),
('Essential Training Tracksuit - Beige', 'Comfortable tracksuit with soft fabric and subtle brand detailing', 89.99, 14);

-- Women's Dresses (category_id: 17)
INSERT INTO products (name, description, price, category_id) VALUES
('Summer Breeze Floral Dress - Lilac', 'Lightweight summer dress with delicate floral pattern and comfortable fit', 69.99, 17),
('Weekend Getaway Wrap Dress - Pink', 'Versatile wrap dress in soft pink fabric with adjustable waist tie', 79.99, 17);

-- Women's Tops (category_id: 18)
INSERT INTO products (name, description, price, category_id) VALUES
('Essential Performance Top', 'Versatile athletic top with moisture-wicking fabric and flattering fit', 39.99, 18);

-- Women's Footwear - Running Shoes (category_id: 19)
INSERT INTO products (name, description, price, category_id) VALUES
('StrideMax Cushioned Running Shoes', 'Women\'s performance running shoes with responsive cushioning and breathable upper', 129.99, 19);

-- Women's Footwear - Sandals (category_id: 20)
INSERT INTO products (name, description, price, category_id) VALUES
('Comfort Plus Ergonomic Sandals', 'Supportive sandals with contoured footbed and adjustable straps', 59.99, 20);

-- Women's Accessories - Bags (category_id: 22)
INSERT INTO products (name, description, price, category_id) VALUES
('Urban Explorer Crossbody Bag - Pink', 'Stylish and functional crossbody bag with multiple compartments and adjustable strap', 64.99, 22),
('Weekend Adventure Tote - Black', 'Spacious tote bag with durable construction and interior organization pockets', 74.99, 22);

-- Team Sports - Basketball (category_id: 28)
INSERT INTO products (name, description, price, category_id) VALUES
('Professional Basketball Jersey', 'Competition-grade basketball jersey with moisture-wicking fabric and team customization options', 54.99, 28),
('Competition Basketball - Official Size', 'Official size and weight basketball with superior grip and durability', 49.99, 28);

-- Team Sports - Soccer (category_id: 27)
INSERT INTO products (name, description, price, category_id) VALUES
('Match Quality Soccer Ball - Size 5', 'Tournament-grade soccer ball with precision stitching and durable construction', 39.99, 27);

-- Individual Sports - Tennis (category_id: 29)
INSERT INTO products (name, description, price, category_id) VALUES
('Pro Tour Tennis Racket', 'Performance tennis racket with power-enhancing frame and comfortable grip', 129.99, 29),
('Championship Tennis Balls - 3 Pack', 'Professional-grade tennis balls with consistent bounce and visibility', 9.99, 29);

-- Individual Sports - Golf (category_id: 30)
INSERT INTO products (name, description, price, category_id) VALUES
('Tour Performance Golf Club Set', 'Complete set of high-performance golf clubs including driver, irons, and putter', 699.99, 30),
('Premium Leather Golf Gloves', 'Soft yet durable leather golf gloves with precision fit and enhanced grip', 29.99, 30),
('Distance Pro Golf Balls - 12 Pack', 'Long-distance golf balls with aerodynamic dimple pattern for reduced drag', 34.99, 30);

-- Fitness - Gym Equipment (category_id: 31)
INSERT INTO products (name, description, price, category_id) VALUES
('Precision Cast Iron Dumbbells - 2kg Pair', 'Professional-grade 2kg dumbbells with ergonomic grip and durable construction', 39.99, 31),
('Heavy Duty Cast Iron Dumbbells - 5kg Pair', 'Premium 5kg dumbbells with comfortable grip and rust-resistant finish', 59.99, 31),
('Professional Training Dumbbells - 10kg Pair', 'Gym-quality 10kg dumbbells with knurled grip for secure handling', 89.99, 31),
('Competition Kettlebell Set - 5kg Pair', 'Competition-grade 5kg kettlebells with color-coded vinyl coating', 64.99, 31),
('Premium Cast Iron Kettlebell - 8kg', 'Professional 8kg kettlebell with balanced design and comfortable grip', 49.99, 31);

-- Fitness - Fitness Apparel (category_id: 32)
INSERT INTO products (name, description, price, category_id) VALUES
('Men\'s Performance Training Set - Grey', 'Coordinated training outfit with moisture-wicking top and quick-dry shorts', 69.99, 32),
('Men\'s Elite Workout Set - Black', 'Premium workout set featuring compression technology and four-way stretch fabric', 79.99, 32),
('Women\'s Essential Training Set - Beige', 'Stylish workout set with supportive top and high-waisted leggings', 74.99, 32),
('Women\'s Premium Fitness Set - Sage Green', 'Eco-friendly fitness set with buttery-soft fabric and seamless construction', 89.99, 32);

-- Yoga (category_id: 26)
INSERT INTO products (name, description, price, category_id) VALUES
('Premium Yoga Mat - 6mm', 'Extra thick yoga mat with non-slip surface and eco-friendly materials', 44.99, 26),
('Deluxe Yoga Starter Kit - Lilac', 'Complete yoga set including mat, blocks, strap, and carrying bag in calming lilac', 79.99, 26),
('Essential Yoga Practice Set - Mint Green', 'Comprehensive yoga set with premium mat, foam blocks, and cotton strap', 74.99, 26),
('Professional Pilates Resistance Bands Set', 'Set of 3 resistance bands with different strengths for varied workout intensity', 24.99, 26);

-- Cycling - Mountain Bikes (category_id: 38)
INSERT INTO products (name, description, price, category_id) VALUES
('Alpine Explorer Mountain Bike - Fire Red', 'All-terrain mountain bike with front suspension and precision gear system', 899.99, 38),
('Trail Blazer Mountain Bike - Forest Green', 'Rugged mountain bike with hydraulic disc brakes and lightweight aluminum frame', 999.99, 38);

-- Cycling - Road Bikes (category_id: 39)
INSERT INTO products (name, description, price, category_id) VALUES
('Velocity Pro Road Bike - Electric Blue', 'Aerodynamic road bike with carbon fork and professional racing geometry', 1299.99, 39),
('Endurance Elite Road Bike - Matte Black', 'Long-distance road bike with vibration-dampening frame and precision components', 1199.99, 39);

-- Water Sports - Swimming (category_id: 40)
INSERT INTO products (name, description, price, category_id) VALUES
('Pro Performance Swim Cap', 'Ergonomic silicone swim cap with wrinkle-free fit and UV protection', 19.99, 40),
('Competition Men\'s Swimming Jammers', 'Professional swimming shorts with water-repellent technology and secure fit', 49.99, 40),
('Aqua Vision Swimming Goggles', 'Anti-fog swimming goggles with UV protection and adjustable silicone strap', 29.99, 40);

-- Track & Field (category_id: 43 - We ensure this matches with the inserted category)
INSERT INTO products (name, description, price, category_id) VALUES
('Elite Sprint Track Spikes', 'Lightweight competition spikes with responsive plate and replaceable pins', 119.99, 43);

-- Camping & Hiking - Tents (category_id: 38)
INSERT INTO products (name, description, price, category_id) VALUES
('Ultralight 2-Person Backpacking Tent', 'Compact and lightweight tent ideal for hiking trips with quick setup design', 249.99, 38),
('Family Camping Tent - 4 Person', 'Spacious 4-person tent with weather protection and separate sleeping areas', 299.99, 38);

-- Camping & Hiking - Backpacks (category_id: 39)
INSERT INTO products (name, description, price, category_id) VALUES
('Expedition Trekking Backpack - Ruby Red', 'Durable 55L backpack with ergonomic harness system and multiple compartments', 159.99, 39),
('Adventure Trail Backpack - Tactical Black', 'Weather-resistant 45L backpack with hydration compatibility and load stabilizers', 149.99, 39);

-- Water Sports - Kayaking
INSERT INTO products (name, description, price, category_id) VALUES
('Recreational Kayak Helmet - Orange', 'Lightweight water sports helmet with adjustable fit system', 69.99, 40),
('Professional Kayak Paddle', 'Lightweight and durable paddle with ergonomic grip and efficient blade design', 129.99, 40),
('Performance Kayak Life Vest - Red', 'Coast guard approved PFD with multiple adjustment points for secure fit', 89.99, 40);

-- Winter Sports - Skiing (category_id: 42)
INSERT INTO products (name, description, price, category_id) VALUES
('Premium Ski Helmet', 'Durable and lightweight helmet with adjustable ventilation and comfortable fit', 89.99, 42),
('Insulated Ski Gloves', 'Waterproof and insulated gloves with reinforced palm for durability', 49.99, 42),
('Performance Ski Goggles', 'Anti-fog ski goggles with wide field of vision and UV protection', 79.99, 42),
('Alpine Down Jacket - Red', 'Insulated down jacket designed for extreme mountain conditions', 189.99, 42),
('Alpine Down Jacket - Black', 'Premium insulated jacket with water-resistant exterior and thermal lining', 189.99, 42);

-- Winter Sports - Snowboarding (category_id: 43)
INSERT INTO products (name, description, price, category_id) VALUES
('All-Mountain Snowboard - Red', 'Versatile snowboard for all terrain conditions with responsive flex pattern', 349.99, 43),
('Freestyle Snowboard - Black', 'Flexible snowboard designed for tricks and park riding with twin-tip design', 329.99, 43),
('Performance Snowboard - Green', 'High-performance snowboard with directional shape for speed and control', 379.99, 43),
('Alpine Snowboarding Boots - Red', 'Supportive snowboard boots with quick-lacing system and thermal lining', 199.99, 43),
('Alpine Snowboarding Boots - Blue', 'Supportive snowboard boots with quick-lacing system and thermal lining', 199.99, 43),
('Performance Snowboard Pants - Blue', 'Waterproof and breathable pants with reinforced seams and articulated knees', 149.99, 43),
('Professional Snowoard Pants - Black', 'Waterproof and breathable pants with reinforced seams and articulated knees', 149.99, 43);

-- Water Sports - Swimming (category_id: 40)
INSERT INTO products (name, description, price, category_id) VALUES
('Competition Women\'s Swimsuit - Red', 'High-performance racing swimsuit with chlorine-resistant fabric', 79.99, 40);

-- Add stock information for these new products
-- This would require knowing the product IDs assigned by the auto-increment, 
-- but since we're adding many products, I'll provide a general approach:

-- For example, for the first new product (assuming it gets ID 31):
INSERT INTO stocks (product_id, size, quantity) VALUES
(31, 'S', 30),
(31, 'M', 45),
(31, 'L', 40),
(31, 'XL', 25);

-- And so on for each product with appropriate sizes and quantities