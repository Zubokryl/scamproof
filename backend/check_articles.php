<?php
require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Capsule\Manager as Capsule;

// Set up Laravel's Eloquent ORM
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => database_path('database.sqlite'),
    'prefix'    => '',
]);
$capsule->setEventDispatcher(new Dispatcher(new Container));
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Load the Article model
require_once 'app/Models/Article.php';

// Get all articles with their categories
$articles = \App\Models\Article::with('category')->get();

echo "Articles in database:\n";
echo "====================\n";

foreach ($articles as $article) {
    echo "ID: {$article->id}\n";
    echo "Title: {$article->title}\n";
    echo "Category ID: {$article->category_id}\n";
    echo "Category Name: " . ($article->category ? $article->category->name : 'No category') . "\n";
    echo "Published: " . ($article->published_at ? 'Yes' : 'No') . "\n";
    echo "------------------------\n";
}