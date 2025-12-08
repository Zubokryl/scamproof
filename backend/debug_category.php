<?php
require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Capsule\Manager as Capsule;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the health category query
echo "Testing health category...\n";

$categorySlug = 'health';
$category = \App\Models\Category::where('slug', $categorySlug)->first();

if (!$category) {
    echo "Category '$categorySlug' not found!\n";
    exit(1);
}

echo "Found category: {$category->name} (ID: {$category->id})\n";

$topics = \App\Models\ForumTopic::where('category_id', $category->id)
    ->with('author:id,name', 'category:id,name,slug')
    ->withCount('replies')
    ->orderByDesc('is_pinned')
    ->orderByDesc('created_at')
    ->get();

echo "Number of topics found: " . $topics->count() . "\n";

foreach ($topics as $topic) {
    echo "- {$topic->title} (ID: {$topic->id}, Status: {$topic->status})\n";
}