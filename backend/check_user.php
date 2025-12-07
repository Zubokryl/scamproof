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

// Check the user with email zubokryl777@example.com
try {
    $user = Capsule::table('users')->where('email', 'zubokryl777@example.com')->first();
    
    if ($user) {
        echo "User found:\n";
        echo "ID: " . $user->id . "\n";
        echo "Name: " . $user->name . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Role: " . $user->role . "\n";
        
        // Update the user's name and role if needed
        if ($user->name !== 'Zubokryl777' || $user->role !== 'admin') {
            Capsule::table('users')
                ->where('id', $user->id)
                ->update([
                    'name' => 'Zubokryl777',
                    'role' => 'admin'
                ]);
            echo "User updated successfully!\n";
        } else {
            echo "User already has correct name and admin role.\n";
        }
    } else {
        echo "User with email zubokryl777@example.com not found.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}