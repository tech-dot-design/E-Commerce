<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();
$orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;

// Fetch order header
$stmt = $pdo->prepare('
    SELECT order_id, user_id, order_date, total_amount, shipping_address, status 
    FROM orders 
    WHERE order_id = ?
');
$stmt->execute([$orderId]);
$order = $stmt->fetch();

// Allow only the owner or an admin to view the order
if (!$order || ($order['user_id'] != $userId && ($_SESSION['role'] ?? '') !== 'admin')) {
    sendResponse(false, 'Order not found or unauthorized', null, 404);
}

// Fetch line items for this order
$stmt = $pdo->prepare('
    SELECT oi.order_item_id, oi.product_id, p.name, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) as subtotal
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
');
$stmt->execute([$orderId]);
$items = $stmt->fetchAll();

// Structure response
$order['order_id']     = (int)$order['order_id'];
$order['total_amount'] = (float)$order['total_amount'];
$order['items']        = $items;

sendResponse(true, 'Order details retrieved', $order);