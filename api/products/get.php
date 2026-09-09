<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

// Read the product ID from the query parameter: ?id=1
$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$stmt = $pdo->prepare('
    SELECT product_id, name, description, price, stock_quantity, image_url, created_at 
    FROM products 
    WHERE product_id = ? AND is_active = 1
');
$stmt->execute([$productId]);
$product = $stmt->fetch();

if (!$product) {
    sendResponse(false, 'Product not found', null, 404);
}

$product['product_id']     = (int)$product['product_id'];
$product['price']          = (float)$product['price'];
$product['stock_quantity'] = (int)$product['stock_quantity'];

sendResponse(true, 'Product details retrieved', $product);