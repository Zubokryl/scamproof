<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Use Laravel's models
use App\Models\Category;
use App\Models\Article;

try {
    // Get the health category
    $category = Category::where('slug', 'health')->first();
    
    if (!$category) {
        echo "Health category not found\n";
        exit;
    }
    
    echo "Health category found: " . $category->name . " (ID: " . $category->id . ")\n";
    
    // Get published articles in this category
    $articles = Article::where('category_id', $category->id)
        ->whereNotNull('published_at')
        ->where('published_at', '<=', now())
        ->get();
    
    echo "Published articles in health category: " . $articles->count() . "\n";
    
    foreach ($articles as $article) {
        echo "- ID: " . $article->id . ", Title: " . $article->title . ", Published at: " . $article->published_at . "\n";
    }
    
    // Also check all articles in this category (published or not)
    $allArticles = Article::where('category_id', $category->id)->get();
    echo "Total articles in health category: " . $allArticles->count() . "\n";
    
    foreach ($allArticles as $article) {
        $status = $article->published_at ? "Published (" . $article->published_at . ")" : "Draft";
        echo "- ID: " . $article->id . ", Title: " . $article->title . ", Status: " . $status . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}