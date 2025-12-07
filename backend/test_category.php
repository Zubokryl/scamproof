<?php

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Capsule\Manager as Capsule;

// Create a new container
$app = new Container();
$app->instance('app', $app);

// Create a new event dispatcher
$events = new Dispatcher($app);

// Create a new database capsule
$capsule = new Capsule($app);
$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => database_path('database.sqlite'),
], 'default');

$capsule->setEventDispatcher($events);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Test the category query
$categorySlug = 'commercial';
echo "Testing category: $categorySlug\n";

$category = \App\Models\Category::where('slug', $categorySlug)->first();
if (!$category) {
    echo "Category not found!\n";
    exit(1);
}

echo "Category found: " . $category->name . " (ID: " . $category->id . ")\n";

$topics = \App\Models\ForumTopic::where('category_id', $category->id)
    ->with('author:id,name', 'category:id,name,slug')
    ->withCount('replies')
    ->orderByDesc('is_pinned')
    ->orderByDesc('created_at')
    ->get();

echo "Found " . $topics->count() . " topics\n";

foreach ($topics as $topic) {
    echo "- " . $topic->title . " (ID: " . $topic->id . ")\n";
}<?php

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Capsule\Manager as Capsule;

// Create a new container
$app = new Container();
$app->instance('app', $app);

// Create a new event dispatcher
$events = new Dispatcher($app);

// Create a new database capsule
$capsule = new Capsule($app);
$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => database_path('database.sqlite'),
], 'default');

$capsule->setEventDispatcher($events);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Test the category query
$categorySlug = 'commercial';
echo "Testing category: $categorySlug\n";

$category = \App\Models\Category::where('slug', $categorySlug)->first();
if (!$category) {
    echo "Category not found!\n";
    exit(1);
}

echo "Category found: " . $category->name . " (ID: " . $category->id . ")\n";

$topics = \App\Models\ForumTopic::where('category_id', $category->id)
    ->with('author:id,name', 'category:id,name,slug')
    ->withCount('replies')
    ->orderByDesc('is_pinned')
    ->orderByDesc('created_at')
    ->get();

echo "Found " . $topics->count() . " topics\n";

foreach ($topics as $topic) {
    echo "- " . $topic->title . " (ID: " . $topic->id . ")\n";
}