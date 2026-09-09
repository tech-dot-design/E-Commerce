<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();
verifyCsrfToken();

$input = getJsonInput();
$shippingAddress = trim($input['shipping_address'] ?? '');

if (empty($shippingAddress)) {
    sendResponse(false, 'Shipping address is required.', null, 400);
}

// Step 1: Find user cart items
$stmt = $pdo->prepare('SELECT cart_id FROM cart WHERE user_id = ?');
$stmt->execute([$userId]);
$cart = $stmt->fetch();

if (!$cart) {
    sendResponse(false, 'Shopping cart is empty', null, 400);
}

$stmt = $pdo->prepare('
    SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity 
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = ?
');
$stmt->execute([(int)$cart['cart_id']]);
$items = $stmt->fetchAll();

if (empty($items)) {
    sendResponse(false, 'Shopping cart is empty', null, 400);
}

// Step 2: Calculate total order amount
$totalAmount = 0.00;
foreach ($items as $item) {
    $totalAmount += $item['price'] * $item['quantity'];
}

// Step 3: Run checkout inside a database transaction
try {
    $pdo->beginTransaction();

    // 3a. Create order record
    $stmt = $pdo->prepare('
        INSERT INTO orders (user_id, total_amount, shipping_address, status) 
        VALUES (?, ?, ?, "pending")
    ');
    $stmt->execute([$userId, $totalAmount, $shippingAddress]);
    $orderId = (int)$pdo->lastInsertId();

    // 3b. Insert order items & reduce product stock
    $insertItemStmt = $pdo->prepare('
        INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
        VALUES (?, ?, ?, ?)
    ');
    $updateStockStmt = $pdo->prepare('
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?
    ');

    foreach ($items as $item) {
        $insertItemStmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
        $updateStockStmt->execute([$item['quantity'], $item['product_id']]);
    }

    // 3c. Clear user cart
    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE cart_id = ?');
    $stmt->execute([(int)$cart['cart_id']]);

    // Commit all changes
    $pdo->commit();

    sendResponse(true, 'Order placed successfully', ['order_id' => $orderId], 201);

} catch (Exception $e) {
    // If anything fails, rollback any changes
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendResponse(false, 'Checkout failed: ' . $e->getMessage(), null, 500);
}