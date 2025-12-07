<?php

require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Find the commercial category and update its name
$category = App\Models\Category::where('slug', 'commercial')->first();
if ($category) {
    $category->name = 'Коммерция';
    $category->save();
    echo "Category updated successfully!\n";
    echo "New name: " . $category->name . "\n";
} else {
    echo "Category not found!\n";
}

?>