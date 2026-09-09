<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();

// Step 1: Find user active cart
$stmt = $pdo->prepare('SELECT cart_id FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);
$cart = $stmt->fetch();

if (!$cart) {
    sendResponse(true, 'Cart items retrieved', []);
}

// Step 2: Select all items in this cart joining the product details
$stmt = $pdo->prepare('
    SELECT ci.product_id, p.name, ci.quantity, p.price, p.image_url 
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = ?
');
$stmt->execute([(int)$cart['cart_id']]);
$items = $stmt->fetchAll();

foreach ($items as &$item) {
    $item['product_id'] = (int)$item['product_id'];
    $item['quantity']   = (int)$item['quantity'];
    $item['price']      = (float)$item['price'];
}

sendResponse(true, 'Cart items retrieved', $items);