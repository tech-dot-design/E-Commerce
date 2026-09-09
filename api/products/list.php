<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';

// Step 1: Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method Not Allowed', null, 405);
}

// Step 2: Fetch only active products
$stmt = $pdo->query('
    SELECT product_id, name, description, price, stock_quantity, image_url, created_at 
    FROM products 
    WHERE is_active = 1 
    ORDER BY product_id ASC
');
$products = $stmt->fetchAll();

// Step 3: Clean up numeric datatypes for JSON
foreach ($products as &$p) {
    $p['product_id']     = (int)$p['product_id'];
    $p['price']          = (float)$p['price'];
    $p['stock_quantity'] = (int)$p['stock_quantity'];
}

sendResponse(true, 'Products retrieved', $products);