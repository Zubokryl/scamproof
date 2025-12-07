<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use App\Models\Article;
use App\Models\Category;
use App\Models\ForumTopic;
use Meilisearch\Client;

class ImportSearchData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'search:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import data into Meilisearch';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Meilisearch data import...');
        
        // Initialize Meilisearch client
        $client = new Client(env('MEILISEARCH_HOST', 'http://localhost:7700'), env('MEILISEARCH_KEY', 'masterKey'));
        
        try {
            // Create indexes if they don't exist
            $this->info('Creating indexes...');
            
            // Create articles index
            try {
                $client->createIndex('articles', ['primaryKey' => 'id']);
                $this->info('Created articles index');
            } catch (\Exception $e) {
                $this->info('Articles index already exists');
            }
            
            // Create categories index
            try {
                $client->createIndex('categories', ['primaryKey' => 'id']);
                $this->info('Created categories index');
            } catch (\Exception $e) {
                $this->info('Categories index already exists');
            }
            
            // Create topics index
            try {
                $client->createIndex('topics', ['primaryKey' => 'id']);
                $this->info('Created topics index');
            } catch (\Exception $e) {
                $this->info('Topics index already exists');
            }
            
            // Import articles
            $this->info('Importing articles...');
            $articles = Article::all();
            $articlesIndex = $client->index('articles');
            $articlesData = $articles->map(function ($article) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'content' => strip_tags($article->content),
                    'category' => $article->category ? $article->category->name : '',
                    'published_at' => $article->published_at,
                ];
            })->toArray();
            
            $articlesIndex->addDocuments($articlesData);
            $this->info("Articles imported: " . count($articlesData));
            
            // Import categories
            $this->info('Importing categories...');
            $categories = Category::all();
            $categoriesIndex = $client->index('categories');
            $categoriesData = $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => $category->description,
                    'slug' => $category->slug,
                ];
            })->toArray();
            
            $categoriesIndex->addDocuments($categoriesData);
            $this->info("Categories imported: " . count($categoriesData));
            
            // Import forum topics
            $this->info('Importing forum topics...');
            $topics = ForumTopic::all();
            $topicsIndex = $client->index('topics');
            $topicsData = $topics->map(function ($topic) {
                return [
                    'id' => $topic->id,
                    'title' => $topic->title,
                    'content' => strip_tags($topic->content),
                    'category' => $topic->category ? $topic->category->name : '',
                    'author' => $topic->author ? $topic->author->name : '',
                    'created_at' => $topic->created_at,
                ];
            })->toArray();
            
            $topicsIndex->addDocuments($topicsData);
            $this->info("Topics imported: " . count($topicsData));
            
            // Configure indexes for intelligent search
            $this->info('Configuring indexes for intelligent search...');
            Artisan::call('search:configure');
            $this->info(Artisan::output());
            
            $this->info('All data imported and configured successfully!');
        } catch (\Exception $e) {
            $this->error('Error importing data: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}