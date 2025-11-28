<?php

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;

// Setup Laravel's database component
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => '127.0.0.1',
    'database'  => 'scam',
    'username'  => 'scam_user',
    'password' => 'Sc@mProof047!',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setEventDispatcher(new Dispatcher(new Container));
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Update the user's role to admin
try {
    // Only update the existing user
    $updated = Capsule::table('users')
        ->where('name', 'Zubokryl777')
        ->update([
            'role' => 'admin',
            'password' => password_hash('ArikMarik888', PASSWORD_DEFAULT)
        ]);
    
    if ($updated) {
        echo "User Zubokryl777 updated successfully to admin role.\n";
    } else {
        echo "User Zubokryl777 not found.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}