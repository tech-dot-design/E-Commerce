<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

requireAdmin();
verifyCsrfToken();

$input   = getJsonInput();
$orderId = (int)($input['order_id'] ?? 0);
$status  = trim($input['status'] ?? '');

$validStatuses = ['pending', 'completed', 'cancelled'];
if (!in_array($status, $validStatuses)) {
    sendResponse(false, 'Invalid order status.', null, 400);
}

$stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE order_id = ?');
$stmt->execute([$status, $orderId]);

sendResponse(true, 'Order status updated successfully');