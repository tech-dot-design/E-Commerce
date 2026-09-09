<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();
verifyCsrfToken();

$productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;

$stmt = $pdo->prepare('SELECT cart_id FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);
$cart = $stmt->fetch();

if ($cart) {
    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?');
    $stmt->execute([(int)$cart['cart_id'], $productId]);
}

sendResponse(true, 'Item removed from cart');