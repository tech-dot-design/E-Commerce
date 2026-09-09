<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

// Restrict this action to administrators
requireAdmin();
verifyCsrfToken();

$input = getJsonInput();
$name        = trim($input['name'] ?? '');
$description = trim($input['description'] ?? '');
$price       = (float)($input['price'] ?? 0);
$stock       = (int)($input['stock_quantity'] ?? 0);
$imageUrl    = trim($input['image_url'] ?? '');

if (empty($name) || $price <= 0) {
    sendResponse(false, 'A valid product name and positive price are required.', null, 400);
}

$stmt = $pdo->prepare('
    INSERT INTO products (name, description, price, stock_quantity, image_url, is_active) 
    VALUES (?, ?, ?, ?, ?, 1)
');
$stmt->execute([$name, $description, $price, $stock, $imageUrl]);

sendResponse(true, 'Product created successfully', [
    'product_id' => (int)$pdo->lastInsertId()
], 201);