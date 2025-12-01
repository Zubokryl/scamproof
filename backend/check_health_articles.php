<?php
require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Capsule\Manager as Capsule;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Use Laravel's models
use App\Models\Article;
use App\Models\Category;

// Get the health category
$category = Category::where('slug', 'health')->first();

if (!$category) {
    echo "Health category not found\n";
    exit;
}

echo "Health category: " . $category->name . " (ID: " . $category->id . ")\n";

// Get published articles in this category
$articles = Article::where('category_id', $category->id)
    ->whereNotNull('published_at')
    ->get();

echo "Published articles in health category: " . $articles->count() . "\n";

foreach ($articles as $article) {
    echo "- ID: " . $article->id . ", Title: " . $article->title . "\n";
}