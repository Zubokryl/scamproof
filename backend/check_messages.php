<?php

// Connect to the database
$db = new SQLite3('database/database.sqlite');

// Check if there are any messages
$result = $db->query("SELECT COUNT(*) as count FROM private_messages");

$row = $result->fetchArray(SQLITE3_ASSOC);
echo "Total messages in database: " . $row['count'] . "\n";

// Check messages between users
$result = $db->query("SELECT * FROM private_messages LIMIT 5");

echo "Sample messages:\n";
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    echo "ID: " . $row['id'] . " | Sender: " . $row['sender_id'] . " | Receiver: " . $row['receiver_id'] . " | Content: " . substr($row['content'], 0, 50) . "...\n";
}

$db->close();
?>