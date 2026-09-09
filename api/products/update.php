<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

requireAdmin();
verifyCsrfToken();

$input = getJsonInput();
$productId = filter_var($input['product_id'] ?? null, FILTER_VALIDATE_INT);

if (!$productId) {
    sendResponse(false, 'Valid product ID is required', null, 400);
}

$checkStmt = $pdo->prepare('SELECT product_id FROM products WHERE product_id = ? AND is_active = TRUE');
$checkStmt->execute([$productId]);
if (!$checkStmt->fetch()) {
    sendResponse(false, 'Product not found', null, 404);
}

$fields = [];
$params = [];

if (isset($input['name']) && trim($input['name']) !== '') {
    $fields[] = '`name` = ?';
    $params[] = trim($input['name']);
}
if (array_key_exists('description', $input)) {
    $fields[] = '`description` = ?';
    $params[] = trim($input['description']);
}
if (isset($input['price'])) {
    $price = filter_var($input['price'], FILTER_VALIDATE_FLOAT);
    if ($price === false || $price < 0) {
        sendResponse(false, 'Price must be a valid non-negative number', null, 400);
    }
    $fields[] = '`price` = ?';
    $params[] = $price;
}
if (isset($input['stock_quantity'])) {
    $stock = filter_var($input['stock_quantity'], FILTER_VALIDATE_INT);
    if ($stock === false || $stock < 0) {
        sendResponse(false, 'Stock quantity must be a non-negative integer', null, 400);
    }
    $fields[] = '`stock_quantity` = ?';
    $params[] = $stock;
}
if (array_key_exists('image_url', $input)) {
    $fields[] = '`image_url` = ?';
    $params[] = trim($input['image_url']) ?: null;
}

if (empty($fields)) {
    sendResponse(false, 'No fields provided for update', null, 400);
}

$params[] = $productId;
$stmt = $pdo->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE product_id = ?');
$stmt->execute($params);

sendResponse(true, 'Product updated successfully');