# Project Folder Structure

To ensure scalability and maintainability, the project follows an organized directory structure that separates the frontend presentation, backend logic, and configuration.

## Directory Tree

```text
ecommerce-project/
├── api/                    # Backend PHP endpoints (REST-style API)
│   ├── auth/               # User authentication (login, register)
│   ├── products/           # Product management endpoints
│   ├── cart/               # Shopping cart logic
│   ├── orders/             # Order processing and history
│   └── users/              # User profile and account management
│       ├── profile.php     # Fetch user profile details
│       └── list.php        # Admin customer overview (GET /api/users/list.php)
├── assets/                 # Frontend static resources
│   ├── css/                # Stylesheets (main.css, components.css)
│   ├── js/                 # JavaScript files (api-client.js, cart-logic.js)
│   └── img/                # Product images and UI icons
├── config/                 # System-wide configuration
│   └── db.php              # Database connection settings
├── includes/               # Reusable PHP logic (Server-side)
│   ├── functions.php       # Global helper functions
│   └── auth_check.php      # Middleware to verify user sessions
├── sql/                    # Database management
│   └── schema.sql          # Initial database structure script
├── index.html              # Main Landing Page / Product Catalog
├── product.html            # Product Detail view
├── login.html              # Login page
├── register.html           # Registration page
├── cart.html               # Shopping Cart page
├── checkout.html           # Checkout and shipping address page
├── profile.html            # User Profile and Order History page
├── order-details.html      # Customer single-order inspection view
└── admin/                  # Admin-specific client-side views
    ├── dashboard.html      # Admin main dashboard
    ├── products.html       # Product management interface
    ├── orders.html         # Order management interface
    └── customers.html      # Customer overview page
```

## Component Descriptions

### 1. `/api` (The Brains)
This directory contains all the PHP files that act as the server-side API. These files handle the business logic and return **JSON** responses. This allows the frontend to be highly dynamic and responsive without full page reloads.

### 2. `/assets` (The Look and Feel)
Contains everything needed to render the user interface. 
- `css/`: Stores all styling rules.
- `js/`: Stores the logic that fetches data from the API and updates the UI.
- `img/`: Stores product images and UI icons.

### 3. `/config` & `/includes` (The Foundation)
- `config/`: Holds sensitive information like database credentials.
- `includes/`: Contains reusable PHP code used to support the API, such as helper functions or session validation logic.

### 4. `/admin` (The Control Room)
Separates the administrative interfaces from the public customer-facing pages to keep the project organized and secure.