# API Design

The backend provides a RESTful-style JSON API. All requests should include appropriate headers (e.g., `Content-Type: application/json` for POST/PUT requests, `Accept: application/json` for GET requests, and `X-CSRF-Token` for state-changing operations).

## 1. Response Standards

All API responses follow a standardized wrapper to ensure consistent handling on the frontend.

### Success Response Template
```json
{
  "success": true,
  "message": "Operation performed successfully",
  "data": { ... } 
}
```
*Note: `data` may be an object, an array, or null depending on the endpoint.*

### Error Response Template
```json
{
  "success": false,
  "message": "A descriptive error message explaining the failure"
}
```

---

## 2. Authentication Endpoints

### Register User
- **URL:** `/api/auth/register.php`
- **Method:** `POST`
- **Payload:** `{ "first_name": "...", "last_name": "...", "email": "...", "password": "..." }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": { "user_id": 1 }
  }
  ```

### Login User
- **URL:** `/api/auth/login.php`
- **Method:** `POST`
- **Payload:** `{ "email": "...", "password": "..." }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

### Logout User
- **URL:** `/api/auth/logout.php`
- **Method:** `POST`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 3. Product Endpoints

### Get All Products
- **URL:** `/api/products/list.php`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Products retrieved",
    "data": [ { "product_id": 1, "name": "...", "price": 10.00, "stock_quantity": 50 }, ... ]
  }
  ```

### Get Single Product
- **URL:** `/api/products/get.php?id=1`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Product retrieved",
    "data": { "product_id": 1, "name": "...", "price": 10.00, "stock_quantity": 50 }
  }
  ```

### Create Product (Admin Only)
- **URL:** `/api/products/create.php`
- **Method:** `POST`
- **Payload:** `{ "name": "...", "description": "...", "price": 10.00, "stock_quantity": 50 }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": { "product_id": 3 }
  }
  ```

### Update Product (Admin Only)
- **URL:** `/api/products/update.php`
- **Method:** `PUT`
- **Payload:** `{ "product_id": 1, "name": "...", "price": 12.00, "stock_quantity": 40 }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Product updated successfully"
  }
  ```

### Delete Product (Admin Only)
- **URL:** `/api/products/delete.php?id=1`
- **Method:** `DELETE`
- **Note:** Performs soft-deletion (`is_active = FALSE`) to retain historical order integrity.
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

---

## 4. Cart Endpoints

### Get Cart Contents
- **URL:** `/api/cart/list.php`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Cart items retrieved",
    "data": [ { "product_id": 1, "name": "...", "quantity": 2, "price": 10.00 }, ... ]
  }
  ```

### Add to Cart
- **URL:** `/api/cart/add.php`
- **Method:** `POST`
- **Payload:** `{ "product_id": 1, "quantity": 1 }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Item added to cart",
    "data": { "cart_total": 10.00, "cart_count": 1 }
  }
  ```

### Update Cart Quantity
- **URL:** `/api/cart/update.php`
- **Method:** `PUT`
- **Payload:** `{ "product_id": 1, "quantity": 3 }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Quantity updated",
    "data": { "cart_total": 30.00, "cart_count": 3 }
  }
  ```

### Remove from Cart
- **URL:** `/api/cart/remove.php?product_id=1`
- **Method:** `DELETE`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Item removed from cart",
    "data": { "cart_total": 0.00, "cart_count": 0 }
  }
  ```

---

## 5. Order Endpoints

### Checkout
- **URL:** `/api/orders/checkout.php`
- **Method:** `POST`
- **Payload:** `{ "shipping_address": "123 Main St, Springfield, IL 62701" }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "data": { "order_id": 101 }
  }
  ```

### Get Order Details
- **URL:** `/api/orders/view.php?order_id=101`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Order details retrieved",
    "data": {
      "order_id": 101,
      "total_amount": 45.50,
      "shipping_address": "123 Main St, Springfield, IL 62701",
      "status": "pending",
      "items": [...]
    }
  }
  ```

### Get My Orders (User History)
- **URL:** `/api/orders/my_orders.php`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Orders retrieved",
    "data": [ { "order_id": 101, "total_amount": 45.50, "status": "pending" }, ... ]
  }
  ```

### Get Order Overview (Admin Only)
- **URL:** `/api/orders/admin_list.php`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Orders retrieved",
    "data": [ { "order_id": 101, "user_id": 1, "total_amount": 45.50, "status": "pending" }, ... ]
  }
  ```

### Update Order Status (Admin Only)
- **URL:** `/api/orders/update_status.php`
- **Method:** `PUT`
- **Payload:** `{ "order_id": 101, "status": "completed" }`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "data": { "order_id": 101, "status": "completed" }
  }
  ```

---

## 6. User Endpoints

### Get Profile
- **URL:** `/api/users/profile.php`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile retrieved",
    "data": { "user_id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com" }
  }
  ```

### Get Customer Overview (Admin Only)
- **URL:** `/api/users/list.php`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Customers retrieved",
    "data": [ { "user_id": 1, "first_name": "John", "last_name": "Doe", "email": "john@example.com", "role": "customer" }, ... ]
  }
  ```