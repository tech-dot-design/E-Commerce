# Feature Requirements

This document outlines the functional requirements for the E-Commerce Product Management System.

## 1. Product Management (Admin)
- **Create Product:** Administrators can add new products with a name, description, price, and stock quantity.
- **Read Products:** Administrators can view a list of all available products.
- **Update Product:** Administrators can modify existing product details (e.g., price or stock).
- **Delete Product:** Administrators can remove products from the catalog.

## 2. Customer Registration & Authentication
- **User Registration:** Customers can create an account by providing their first name, last name, email, and a password.
- **User Login:** Users can authenticate themselves using their email and password.
- **Profile Management:** (Optional/Future) Users can update their profile information.

## 3. Shopping Cart Functionality
- **Persistent Cart:** The system maintains a server-side cart for each user, ensuring items remain in the cart across different browser sessions.
- **Add to Cart:** Customers can browse the product catalog and add items to their server-side cart.
- **View Cart:** Customers can view the items currently in their cart, including quantities and subtotal.
- **Update Cart:** Customers can adjust the quantity of items in the cart or remove items entirely via the API.

## 4. Order Management
- **Checkout:** Customers can convert their shopping cart into a formal order.
- **Order History:** Customers can view a list of their past orders.
- **Order Details:** Customers can view the specific items within a single order.
- **Order Status Tracking:** Customers can see the current status of their orders (e.g., Pending, Completed).

## 5. Administrative Overview
- **Order Overview:** Administrators can view all orders placed within the system.
- **Customer Overview:** Administrators can view a list of registered customers.
- **Inventory Control:** Administrators can monitor stock levels through the product management system.
