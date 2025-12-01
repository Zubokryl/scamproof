<?php

// Simple script to test the API
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json',
        'timeout' => 10
    ]
]);

$response = file_get_contents('http://localhost:8000/api/categories', false, $context);

if ($response === false) {
    echo "Error: Could not connect to API\n";
    exit(1);
}

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "Error: Invalid JSON response\n";
    echo "Response: " . $response . "\n";
    exit(1);
}

echo "Categories API Response:\n";
echo "======================\n";
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);