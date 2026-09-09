# Testing Plan

This document outlines the strategy for ensuring the quality and reliability of the E-Commerce Product Management System.

## 1. Testing Strategy

We will use a combination of manual and automated testing methods to validate the application's functionality and security.

## 2. Test Categories

### A. Unit Testing
Focuses on testing individual functions and logic components in isolation.
- **Examples:**
    - Verifying the price calculation logic for the shopping cart.
    - Testing the password hashing and verification process.
    - Validating input format functions (email, numbers).

### B. Integration Testing
Focuses on how different components of the system work together.
- **Examples:**
    - Testing the flow of adding a product to the cart and verifying its presence in the database.
    - Verifying that a successful registration creates a new record in the `users` table.
    - Testing the interaction between the PHP API and the MySQL database.

### C. Functional (End-to-End) Testing
Simulates real user scenarios from start to finish.
- **Scenario 1: Customer Purchase Flow**
    1. Register a new user.
    2. Log in.
    3. Browse products.
    4. Add items to the cart.
    5. Checkout the cart.
    6. Verify the order appears in the 'Order History' page.
- **Scenario 2: Admin Inventory Management**
    1. Log in as an admin.
    2. Add a new product.
    3. Update the price of an existing product.
    4. Delete a product.
    5. Verify changes are reflected in the public catalog.

### D. Persistence Testing
- **Cart Persistence:** Verify that the shopping cart state is preserved across different browser sessions (e.g., logging out and back in, or closing and reopening the browser) by validating that the cart data is retrieved correctly from the server-side database/session.

## 3. Testing Checklist

- [ ] All CRUD operations (Create, Read, Update, Delete) work as expected.
- [ ] User authentication (Login/Registration) is secure and functional.
- [ ] Shopping cart correctly handles item quantities and totals via API.
- [ ] Database constraints are respected (e.g., unique email addresses).
- [ ] Error messages are helpful and do not leak sensitive information.
