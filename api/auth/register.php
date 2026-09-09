<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

// Step 1: Receive input
$input = getJsonInput();
$firstName = trim($input['first_name'] ?? '');
$lastName  = trim($input['last_name'] ?? '');
$email     = trim($input['email'] ?? '');
$password  = $input['password'] ?? '';

// Step 2: Validate inputs
if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
    sendResponse(false, 'All fields are required.', null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format.', null, 400);
}

// Step 3: Check if email is already taken
$stmt = $pdo->prepare('SELECT user_id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    sendResponse(false, 'Email is already registered.', null, 400);
}

// Step 4: Hash the password securely
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Step 5: Insert new customer account
$stmt = $pdo->prepare('
    INSERT INTO users (first_name, last_name, email, password, role) 
    VALUES (?, ?, ?, ?, "customer")
');
$stmt->execute([$firstName, $lastName, $email, $hashedPassword]);

sendResponse(true, 'Account created successfully', [
    'user_id' => (int)$pdo->lastInsertId()
], 201);