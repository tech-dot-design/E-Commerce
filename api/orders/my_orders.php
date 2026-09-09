<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();

$stmt = $pdo->prepare('
    SELECT order_id, total_amount, shipping_address, status, order_date 
    FROM orders 
    WHERE user_id = ? 
    ORDER BY order_id DESC
');
$stmt->execute([$userId]);
$orders = $stmt->fetchAll();

foreach ($orders as &$order) {
    $order['order_id']     = (int)$order['order_id'];
    $order['total_amount'] = (float)$order['total_amount'];
}

sendResponse(true, 'Orders retrieved', $orders);