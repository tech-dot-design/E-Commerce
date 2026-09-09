<?php
// Helper 1: Send a standardized JSON response back to JavaScript
function sendResponse($success, $message, $data = null, $statusCode = 200) {
    // Set the HTTP response status code (e.g., 200 OK, 400 Bad Request)
    http_response_code($statusCode);

    // Tell the browser that the response is JSON
    header('Content-Type: application/json; charset=utf-8');

    // Encode our PHP array into a JSON string and print it
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ]);

    // Always stop the script after sending the response
    exit;
}

// Helper 2: Read raw JSON data sent by fetch/ApiClient
function getJsonInput() {
    // php://input reads the raw body of the HTTP request
    $rawInput = file_get_contents('php://input');
    
    if (empty($rawInput)) {
        return [];
    }

    $decoded = json_decode($rawInput, true);

    // If valid JSON, return array; otherwise return empty array
    return is_array($decoded) ? $decoded : [];
}