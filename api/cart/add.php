<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();
verifyCsrfToken();

$input     = getJsonInput();
$productId = (int)($input['product_id'] ?? 0);
$quantity  = (int)($input['quantity'] ?? 1);

if ($productId <= 0 || $quantity <= 0) {
    sendResponse(false, 'Valid product ID and positive quantity required.', null, 400);
}

// Step 1: Ensure user has a cart record (create one if not)
$stmt = $pdo->prepare('SELECT cart_id FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);
$cart = $stmt->fetch();

if (!$cart) {
    $stmt = $pdo->prepare('INSERT INTO cart (user_id) VALUES (?)');
    $stmt->execute([$userId]);
    $cartId = (int)$pdo->lastInsertId();
} else {
    $cartId = (int)$cart['cart_id'];
}

// Step 2: Check if this item is already in their cart
$stmt = $pdo->prepare('SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?');
$stmt->execute([$cartId, $productId]);
$existingItem = $stmt->fetch();

if ($existingItem) {
    // Item exists: increase quantity
    $newQty = $existingItem['quantity'] + $quantity;
    $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?');
    $stmt->execute([$newQty, $existingItem['cart_item_id']]);
} else {
    // New item: insert row
    $stmt = $pdo->prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)');
    $stmt->execute([$cartId, $productId, $quantity]);
}

// Step 3: Calculate new cart totals to return to the UI
$stmt = $pdo->prepare('
    SELECT SUM(ci.quantity) as count, SUM(ci.quantity * p.price) as total 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.product_id 
    WHERE ci.cart_id = ?
');
$stmt->execute([$cartId]);
$summary = $stmt->fetch();

sendResponse(true, 'Item added to cart', [
    'cart_count' => (int)($summary['count'] ?? 0),
    'cart_total' => (float)($summary['total'] ?? 0.00)
]);