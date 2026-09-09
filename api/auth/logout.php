<?php
require_once __DIR__ . '/../../includes/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Clear all session variables and destroy the session
$_SESSION = [];
session_destroy();

sendResponse(true, 'Logged out successfully');