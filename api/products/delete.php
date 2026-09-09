<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

requireAdmin();
verifyCsrfToken();

$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Soft delete: keep the record in the database, but mark is_active = 0
$stmt = $pdo->prepare('UPDATE products SET is_active = 0 WHERE product_id = ?');
$stmt->execute([$productId]);

sendResponse(true, 'Product deleted successfully');