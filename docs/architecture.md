# System Architecture

## Overview
The E-Commerce Product Management System follows a classic Client-Server architecture, where the frontend communicates with a PHP backend, which interacts with a MySQL database.

## Architecture Diagram (Conceptual)
[User Browser] <--> [HTML/CSS/JS Frontend] <--> [PHP Backend API] <--> [MySQL Database]

## Component Descriptions

### 1. Frontend (Client Side)
- **Technologies:** HTML5, CSS3, JavaScript.
- **Role:** Handles user interactions, performs client-side validation, and uses `fetch` API to communicate with the server.

### 2. Backend (Server Side)
- **Technologies:** PHP.
- **Role:** Processes business logic, manages user sessions, interacts with the database, and returns data in JSON format for the frontend.

### 3. Database (Data Layer)
- **Technologies:** MySQL.
- **Role:** Stores all persistent data including products, users, and orders.

## Data Flow
1. **User Interaction:** A user performs an action (e.g., adding a product to the cart).
2. **Request:** The frontend sends an asynchronous HTTP request (using JavaScript `fetch`) to a specific PHP endpoint.
3. **Processing:** The PHP script receives the request, validates the input, and performs the required business logic.
4. **Database Interaction:** The PHP script executes SQL queries against the MySQL database.
5. **Response:** The PHP script returns a JSON response to the client.
6. **UI Update:** The frontend receives the JSON response and updates the DOM accordingly.
