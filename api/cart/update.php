<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();
verifyCsrfToken();

$input     = getJsonInput();
$productId = (int)($input['product_id'] ?? 0);
$quantity  = (int)($input['quantity'] ?? 0);

// Step 1: Find user cart
$stmt = $pdo->prepare('SELECT cart_id FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);
$cart = $stmt->fetch();

if (!$cart) {
    sendResponse(false, 'Cart not found', null, 404);
}
$cartId = (int)$cart['cart_id'];

// Step 2: If quantity is 0 or less, remove item; otherwise update
if ($quantity <= 0) {
    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?');
    $stmt->execute([$cartId, $productId]);
} else {
    $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?');
    $stmt->execute([$quantity, $cartId, $productId]);
}

// Step 3: Return updated totals
$stmt = $pdo->prepare('
    SELECT SUM(ci.quantity) as count, SUM(ci.quantity * p.price) as total 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.product_id 
    WHERE ci.cart_id = ?
');
$stmt->execute([$cartId]);
$summary = $stmt->fetch();

sendResponse(true, 'Quantity updated', [
    'cart_count' => (int)($summary['count'] ?? 0),
    'cart_total' => (float)($summary['total'] ?? 0.00)
]);