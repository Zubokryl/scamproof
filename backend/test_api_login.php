<?php

// Test login API endpoint
$url = 'http://localhost:8000/api/login';

$data = [
    'email' => 'zubokryl777@example.com',
    'password' => 'ArikMarik888'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

echo "Sending login request...\n";
echo "URL: " . $url . "\n";
echo "Data: " . json_encode($data) . "\n";

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error occurred\n";
} else {
    echo "Response:\n";
    echo $result . "\n";
}

// Also test with curl to see if there are any differences
echo "\n--- Testing with cURL ---\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";

curl_close($ch);