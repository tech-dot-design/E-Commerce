# Setup Guide

This guide provides instructions for setting up the E-Commerce Product Management System in a local development environment.

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Web Server:** Apache or Nginx.
- **PHP:** Version 7.4 or higher (8.x recommended).
- **Database:** MySQL or MariaDB.
- **Local Development Tool (Recommended):** XAMPP, MAMP, or WampServer for an all-in-one setup.

## 2. Database Setup

1. Start your MySQL service.
2. Open your database management tool (like phpMyAdmin).
3. Create a new database named `ecommerce_db`.
4. Import the provided SQL schema (once available) which defines the following six core tables and their relationships:
    * `users` (Master user data)
    * `products` (Product catalog)
    * `cart` (User-specific cart sessions)
    * `cart_items` (Links products to carts via `cart_id` and `product_id`)
    * `orders` (Master order records)
    * `order_items` (Links products to orders via `order_id` and `product_id`)

## 3. Application Setup

1. Copy the project folder into your web server's root directory (e.g., `htdocs` for XAMPP or `www` for WampServer).
2. Configure the database connection:
   - Locate the database configuration file (e.g., `config/db.php`).
   - Update the credentials: `db_host`, `db_name`, `db_user`, and `db_password`.

## 4. Running the Application

1. Open your web browser.
2. Navigate to `http://localhost/[your-project-folder-name]/`.
3. You should see the product catalog or the home page.

## 5. Troubleshooting

- **Database Connection Error:** Verify that your database credentials in the configuration file match your local MySQL settings.
- **404 Errors:** Ensure the URL path matches your folder structure in the web server root.
- **Permission Errors:** Ensure your web server has read/write permissions for the project directory.