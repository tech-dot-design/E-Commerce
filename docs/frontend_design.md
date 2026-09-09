# Frontend Design

The frontend is a responsive web application built using modern web standards.

## 1. Core Technologies
- **HTML5:** For semantic structure.
- **CSS3:** For layout (Flexbox/Grid) and styling.
- **JavaScript (ES6+):** For dynamic content updates and asynchronous API calls.

## 2. Page Structure

### Public Pages
- **Home/Product Catalog:** Displays all available products with filtering/sorting options.
- **Product Detail:** Shows a comprehensive view of a single product.
- **Login/Registration:** Forms for user authentication and account creation.

### Customer Pages
- **Shopping Cart:** A dedicated page to review selected items.
- **Checkout Page:** A form to finalize the purchase and capture shipping addresses.
- **Order History:** A dashboard for customers to view their past orders.
- **Order Details:** A granular view of items and pricing for a single completed order.

### Administrative Pages (Dashboard)
- **Product Management Dashboard:** A table-based view of the inventory with "Add", "Edit", and "Delete" actions.
- **Order Management Dashboard:** A view to monitor incoming orders and update their statuses.
- **Customer Overview Dashboard:** A view for administrators to monitor registered customer accounts.

## 3. Design Principles
- **Responsiveness:** The layout should adapt seamlessly from desktop to mobile devices.
- **User Experience (UX):** Intuitive navigation, clear feedback on actions (e.g., "Added to cart" notifications), and error handling.
- **Consistency:** Uniform typography, color schemes, and component styles throughout the application.

## 4. State Management
The application manages state through a synchronized Client-Server model:
- **Server-Side State:** The primary "source of truth" for the shopping cart and user session is stored on the server via PHP Sessions and the MySQL database.
- **API-Driven Updates:** The frontend does not use `localStorage` or `sessionStorage` for cart persistence. Mutation endpoints (`add.php`, `update.php`, `remove.php`) return immediate cart summaries (`cart_total`, `cart_count`) to update badge counters and subtotals instantly. Full line-item synchronization is handled on page load or cart views via `/api/cart/list.php`.