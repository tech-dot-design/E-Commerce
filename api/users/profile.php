<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth_check.php';

$userId = requireAuth();

$stmt = $pdo->prepare('SELECT user_id, first_name, last_name, email, role, created_at FROM users WHERE user_id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    sendResponse(false, 'User not found', null, 404);
}

$user['user_id'] = (int)$user['user_id'];
sendResponse(true, 'Profile retrieved', $user);