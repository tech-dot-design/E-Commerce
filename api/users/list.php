<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

requireAdmin();

$stmt = $pdo->query('
    SELECT user_id, first_name, last_name, email, role, created_at 
    FROM users 
    WHERE role = "customer" 
    ORDER BY user_id ASC
');
$customers = $stmt->fetchAll();

foreach ($customers as &$c) {
    $c['user_id'] = (int)$c['user_id'];
}

sendResponse(true, 'Customers retrieved', $customers);