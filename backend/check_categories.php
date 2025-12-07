<?php

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;

// Create a service container
$container = new Container();

// Create a capsule instance
$capsule = new Capsule($container);

// Add database connection
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => '127.0.0.1',
    'database'  => 'scam',
    'username'  => 'scam_user',
    'password'  => 'Sc@mProof047!',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => '',
]);

// Make this Capsule instance available globally via static methods
$capsule->setAsGlobal();

// Setup the Eloquent ORM
$capsule->bootEloquent();

// Fetch categories
try {
    $categories = Capsule::table('categories')->get();
    
    echo "Categories in database:\n";
    echo "=====================\n";
    
    foreach ($categories as $category) {
        echo "ID: {$category->id}\n";
        echo "Name: {$category->name}\n";
        echo "Slug: {$category->slug}\n";
        echo "Description: {$category->description}\n";
        echo "Icon: {$category->icon}\n";
        echo "---------------------\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}