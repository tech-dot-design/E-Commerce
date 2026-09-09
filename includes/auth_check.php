<?php
// Step 1: Start the PHP session if it has not been started yet
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Step 2: Helper to ensure the visitor is logged in
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendResponse(false, 'Unauthorized: Please log in first.', null, 401);
    }
    return (int)$_SESSION['user_id'];
}

// Step 3: Helper to ensure the logged-in user is an administrator
function requireAdmin() {
    // First, make sure they are logged in at all
    requireAuth();

    // Check if their role in the session is 'admin'
    if (($_SESSION['role'] ?? '') !== 'admin') {
        sendResponse(false, 'Forbidden: Admin access required.', null, 403);
    }
}

// Step 4: Verify CSRF token on modifying actions (POST, PUT, DELETE)
function verifyCsrfToken() {
    $method = $_SERVER['REQUEST_METHOD'];

    // Only check CSRF on data-modifying requests
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        // Read header sent by ApiClient: 'X-CSRF-Token'
        $clientToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';

        if (empty($clientToken) || $clientToken !== $sessionToken) {
            sendResponse(false, 'Invalid or missing CSRF token.', null, 403);
        }
    }
}