<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

requireAdmin();

$stmt = $pdo->query('
    SELECT o.order_id, u.email, o.order_date, o.total_amount, o.status 
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    ORDER BY o.order_id DESC
');
$orders = $stmt->fetchAll();

foreach ($orders as &$o) {
    $o['order_id']     = (int)$o['order_id'];
    $o['total_amount'] = (float)$o['total_amount'];
}

sendResponse(true, 'Admin orders retrieved', $orders);