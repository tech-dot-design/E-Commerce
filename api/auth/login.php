<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';

// Start session to store user login state
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Step 1: Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

// Step 2: Get email and password from incoming JSON
$input = getJsonInput();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Step 3: Validate input fields are not empty
if (empty($email) || empty($password)) {
    sendResponse(false, 'Email and password are required.', null, 400);
}

// Step 4: Find user by email in the database
$stmt = $pdo->prepare('SELECT user_id, first_name, last_name, email, password, role FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Step 5: Verify password against the stored bcrypt hash
if (!$user || !password_verify($password, $user['password'])) {
    sendResponse(false, 'Invalid email or password.', null, 401);
}

// Step 6: Save user details into PHP session
$_SESSION['user_id'] = (int)$user['user_id'];
$_SESSION['role'] = $user['role'];

// Step 7: Generate a secure CSRF token for the frontend to use
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// Step 8: Return success with user details and token
sendResponse(true, 'Login successful', [
    'user_id'    => (int)$user['user_id'],
    'first_name' => $user['first_name'],
    'last_name'  => $user['last_name'],
    'role'       => $user['role'],
    'csrf_token' => $_SESSION['csrf_token']
]);