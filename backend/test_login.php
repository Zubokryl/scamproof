<?php

require_once 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client([
    'base_uri' => 'http://localhost:8000',
    'timeout' => 10.0,
]);

try {
    $response = $client->post('/api/login', [
        'json' => [
            'email' => 'nick000@gmail.com',
            'password' => 'password123'
        ],
        'headers' => [
            'Content-Type' => 'application/json',
        ]
    ]);
    
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getBody() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    if (method_exists($e, 'getResponse') && $e->getResponse()) {
        echo "Response Status: " . $e->getResponse()->getStatusCode() . "\n";
        echo "Response Body: " . $e->getResponse()->getBody() . "\n";
    }
}