# Database Schema

The system uses a MySQL database to store all essential information. Below is the structure of the core tables.

## 1. Users Table
Stores information for both customers and administrators.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each user |
| `first_name` | VARCHAR(50) | NOT NULL | User's first name |
| `last_name` | VARCHAR(50) | NOT NULL | User's last name |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | User's email address (used for login) |
| `password` | VARCHAR(255) | NOT NULL | Hashed password |
| `role` | ENUM('customer', 'admin') | NOT NULL, DEFAULT 'customer' | User's role in the system |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

## 2. Products Table
Stores the product catalog.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `product_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each product |
| `name` | VARCHAR(255) | NOT NULL | Name of the product |
| `description` | TEXT | | Detailed product description |
| `price` | DECIMAL(10, 2) | NOT NULL | Price of the product |
| `stock_quantity`| INT | NOT NULL | Number of units available |
| `image_url` | VARCHAR(255) | | Link to the product image |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft-delete status flag to preserve historical orders |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Product added timestamp |

## 3. Cart Table
Stores a reference to the active shopping session for a user.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `cart_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the cart |
| `user_id` | INT | UNIQUE, NOT NULL, FOREIGN KEY (users.user_id) | The owner of the cart (one active cart per user) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the cart was created |

## 4. Cart Items Table
Stores the individual items within a user's cart. A composite unique key on `(cart_id, product_id)` prevents duplicate entries.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `cart_item_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the line item |
| `cart_id` | INT | NOT NULL, FOREIGN KEY (cart.cart_id) ON DELETE CASCADE | Reference to the parent cart |
| `product_id` | INT | NOT NULL, FOREIGN KEY (products.product_id) | Reference to the product |
| `quantity` | INT | NOT NULL, DEFAULT 1 | Number of units in the cart |

## 5. Orders Table
Stores high-level order information including delivery details.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `order_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each order |
| `user_id` | INT | NOT NULL, FOREIGN KEY (users.user_id) | The user who placed the order |
| `order_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the order was placed |
| `total_amount` | DECIMAL(10, 2) | NOT NULL | Total cost of the order |
| `shipping_address` | TEXT | NOT NULL | Physical delivery destination for the order |
| `status` | ENUM('pending', 'completed', 'cancelled') | NOT NULL, DEFAULT 'pending' | Current state of the order |

## 6. Order Items Table
Stores the individual items within each order.

| Column Name     | Data Type      | Constraints                                               | Description                               |
| :-------------- | :------------- | :-------------------------------------------------------- | :---------------------------------------- |
| `order_item_id` | INT            | PRIMARY KEY, AUTO_INCREMENT                               | Unique identifier for the line item       |
| `order_id`      | INT            | NOT NULL, FOREIGN KEY (orders.order_id) ON DELETE CASCADE | Reference to the parent order             |
| `product_id`    | INT            | NOT NULL, FOREIGN KEY (products.product_id)               | Reference to the product purchased        |
| `quantity`      | INT            | NOT NULL                                                  | Number of units purchased                 |
| `unit_price`    | DECIMAL(10, 2) | NOT NULL                                                  | Price of the product at the time of order |