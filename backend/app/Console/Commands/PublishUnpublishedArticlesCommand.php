<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;

class PublishUnpublishedArticlesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:publish-unpublished';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish all unpublished articles by setting their published_at timestamp to now';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $unpublishedArticles = Article::whereNull('published_at')->get();
        
        if ($unpublishedArticles->isEmpty()) {
            $this->info('No unpublished articles found.');
            return 0;
        }
        
        $this->info("Found {$unpublishedArticles->count()} unpublished articles. Publishing them now...");
        
        foreach ($unpublishedArticles as $article) {
            $article->published_at = now();
            $article->save();
            
            $this->info("Published article #{$article->id}: '{$article->title}'");
        }
        
        $this->info('All unpublished articles have been published successfully.');
        
        return 0;
    }
}