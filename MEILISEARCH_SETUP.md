# Meilisearch Setup Instructions

## Prerequisites
1. PHP 8.2 or higher
2. Composer
3. Laravel project set up
4. Database with existing data

## Installation Steps

### 1. Install Meilisearch Package
```bash
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

### 2. Configure Environment Variables
Add the following to your `.env` file:
```env
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=masterKey
```

### 3. Add Searchable Trait to Models
Add `use Laravel\Scout\Searchable;` and `use Searchable;` to your models:
```php
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;
    
    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => strip_tags($this->content),
            'category' => $this->category ? $this->category->name : '',
            'published_at' => $this->published_at,
        ];
    }
}
```

### 4. Create Search Controller
Create `app/Http/Controllers/SearchController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\ForumTopic;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');

        $articles = Article::search($query)->take(30)->get();
        $categories = Category::search($query)->take(10)->get();
        $topics = ForumTopic::search($query)->take(20)->get();

        return response()->json([
            'articles' => $articles,
            'categories' => $categories,
            'topics' => $topics,
        ]);
    }
}
```

### 5. Add Search Route
Add to `routes/api.php`:
```php
use App\Http\Controllers\SearchController;

Route::get('/search', [SearchController::class, 'search']);
```

### 6. Download and Run Meilisearch
Download Meilisearch from https://www.meilisearch.com/docs/learn/getting_started/installation

Run Meilisearch:
```bash
./meilisearch --master-key=masterKey
```

### 7. Import Data
Run the import command (this will also configure Meilisearch automatically):
```bash
php artisan search:import
```

Alternatively, you can use Laravel Scout's built-in import:
```bash
php artisan scout:import "App\Models\Article"
php artisan scout:import "App\Models\Category"
php artisan scout:import "App\Models\ForumTopic"
```

Then configure Meilisearch for intelligent search:
```bash
php artisan search:configure
```

### 8. Update Frontend
Update your frontend search component to use the new API endpoint.

## Windows Setup
Run the `setup_meilisearch.bat` script to automatically:
1. Download Meilisearch
2. Start the Meilisearch server
3. Import your data

## Troubleshooting
1. If you get "Class 'Laravel\Scout\Searchable' not found", run `composer dump-autoload`
2. If Meilisearch doesn't start, check that port 7700 is available
3. If search returns no results:
   - Verify data was imported with `php artisan search:import` or `php artisan scout:import`
   - Configure Meilisearch indexes with `php artisan search:configure`
   - Make sure Meilisearch is running on port 7700
4. If search is not finding relevant articles:
   - Run `php artisan search:configure` to set up intelligent search settings
   - Re-import data with `php artisan search:import`
   - Check that articles contain the keywords you're searching for