# STRIVE - Sports & Lifestyle E-commerce Platform

## 📋 Overview
STRIVE is a modern e-commerce platform specializing in sports and lifestyle products. The application features a React-based frontend, Spring Boot backend, and MySQL database, providing a complete shopping experience with user authentication, product browsing, cart management, checkout process, and order tracking.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **UI Library**: Material UI 6
- **State Management**: React Context API
- **Routing**: React Router 7
- **API Communication**: Axios
- **Authentication**: JWT, Google OAuth
- **Data Visualization**: Chart.js

### Backend
- **Framework**: Spring Boot 3.4
- **Database Access**: Spring Data JPA
- **Security**: Spring Security, JWT
- **Build Tool**: Maven
- **Email Service**: Spring Mail

### Database
- **RDBMS**: MySQL

## ✨ Features

- **User Authentication**
  - JWT-based authentication
  - Social login (Google)
  - Password reset functionality

- **Product Management**
  - Category browsing with hierarchical structure
  - Product search and filtering
  - Product details with images
  - Stock management

- **Shopping Experience**
  - Cart management
  - Checkout process
  - Multiple shipping addresses
  - Order history and tracking

- **Admin Dashboard**
  - Sales metrics and reporting
  - Inventory management
  - Order processing
  - User management

- **Responsive Design**
  - Mobile-friendly interface
  - Swipeable product galleries

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Java JDK 21
- Maven
- MySQL Server
- Python 3.x (for database initialization)

### Database Setup
1. Configure MySQL credentials in `init_database.py`
2. Run the database initialization script:
   ```bash
   python init_database.py
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure database connection and environment variables in `src/main/resources/application.properties`
3. Build and run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser and go to `http://localhost:3000`

## 📂 Project Structure

```
strive/
├── frontend/                  # React frontend
│   ├── public/                # Static files
│   └── src/                   # Source code
├── backend/                   # Spring Boot backend
│   └── src/                   # Source code
├── images/                    # Product and category images
├── schema.sql                 # Database schema
├── init_database.py           # Database initialization script
└── README.md                  # Project documentation
```

## 👥 User Accounts

The application comes with pre-configured user accounts:

| Email              | Password | Role     |
|--------------------|----------|----------|
| admin@strive.com   | 123456   | ADMIN    |
| manager@strive.com | 123456   | MANAGER  |
| john@example.com   | 123456   | CUSTOMER |
| jane@example.com   | 123456   | CUSTOMER |

## 🔄 API Endpoints

The backend provides RESTful APIs for:
- User authentication and management
- Product and category operations
- Cart and order processing
- Payment processing
- Admin functionalities
