<?php
// Step 1: Database configuration settings
$host     = 'localhost';
$db_name  = 'ecommerce_db';
$username = 'root';
$password = ''; // Default XAMPP MySQL password is empty

// Step 2: Connect to MySQL using PDO (PHP Data Objects)
try {
    // Set up DSN (Data Source Name) with UTF-8 character encoding
    $dsn = "mysql:host={$host};dbname={$db_name};charset=utf8mb4";

    $pdo = new PDO($dsn, $username, $password, [
        // Throw exceptions whenever an SQL error occurs
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        // Fetch results as associative arrays (e.g., $row['name'])
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // Use real prepared statements instead of emulating them
        PDO::ATTR_EMULATE_PREPARES   => false
    ]);
} catch (PDOException $e) {
    // If the database fails to connect, stop and send an error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'data'    => null
    ]);
    exit;
}