<?php

// Connect to the database
$db = new SQLite3('database/database.sqlite');

// Check if the table exists and get its structure
$result = $db->query("PRAGMA table_info(private_messages)");

echo "Table structure for private_messages:\n";

while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    echo "Column: " . $row['name'] . " | Type: " . $row['type'] . " | Not Null: " . $row['notnull'] . " | Default: " . $row['dflt_value'] . " | PK: " . $row['pk'] . "\n";
}

$db->close();
?>