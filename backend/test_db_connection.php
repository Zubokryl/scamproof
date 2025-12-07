<?php

// Test database connection with credentials from .env
$host = '127.0.0.1';
$dbname = 'scam';
$username = 'scam_user';
$password = 'Sc@mProof047!';

echo "Attempting to connect to database...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n";
echo "Password: " . (empty($password) ? "(empty)" : "(provided)") . "\n";

try {
    echo "Creating PDO connection...\n";
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected successfully to the database!\n";
    
    // Test a simple query
    echo "Executing test query...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Number of users in the database: " . $result['count'] . "\n";
    
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n";
}
?>