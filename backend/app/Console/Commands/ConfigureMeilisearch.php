<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Meilisearch\Client;

class ConfigureMeilisearch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'search:configure';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configure Meilisearch indexes for intelligent search';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Configuring Meilisearch indexes...');
        
        // Initialize Meilisearch client
        $client = new Client(
            env('MEILISEARCH_HOST', 'http://localhost:7700'),
            env('MEILISEARCH_KEY', 'masterKey')
        );
        
        try {
            // Configure articles index
            $this->configureArticlesIndex($client);
            
            // Configure categories index
            $this->configureCategoriesIndex($client);
            
            // Configure topics index
            $this->configureTopicsIndex($client);
            
            $this->info('Meilisearch configuration completed successfully!');
        } catch (\Exception $e) {
            $this->error('Error configuring Meilisearch: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
    
    private function configureArticlesIndex(Client $client)
    {
        $this->info('Configuring articles index...');
        $index = $client->index('articles');
        
        // Set searchable attributes (order matters - first is most important)
        $index->updateSearchableAttributes([
            'title',
            'content',
            'category'
        ]);
        
        // Set ranking rules for better semantic relevance
        // 'words' - prioritizes documents with more matching words
        // 'typo' - handles typos gracefully
        // 'proximity' - prioritizes documents where words appear close together (important for semantic search)
        // 'attribute' - prioritizes matches in title over content
        // 'sort' - respects custom sorting
        // 'exactness' - prioritizes exact matches
        $index->updateRankingRules([
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness'
        ]);
        
        // Configure typo tolerance (more lenient for better matching)
        $index->updateTypoTolerance([
            'enabled' => true,
            'minWordSizeForTypos' => [
                'oneTypo' => 4,
                'twoTypos' => 8
            ],
            'disableOnWords' => [],
            'disableOnAttributes' => []
        ]);
        
        // Configure separators for Russian language (important for word splitting)
        // This helps Meilisearch properly tokenize Russian text
        $index->updateSeparatorTokens([
            ' ',
            '.',
            ',',
            ';',
            ':',
            '!',
            '?',
            '-',
            '—',
            '\n',
            '\t'
        ]);
        
        // Set filterable attributes (if needed)
        $index->updateFilterableAttributes(['category', 'published_at']);
        
        // Set sortable attributes
        $index->updateSortableAttributes(['published_at']);
        
        // Set displayed attributes
        $index->updateDisplayedAttributes([
            'id',
            'title',
            'content',
            'category',
            'published_at'
        ]);
        
        $this->info('Articles index configured');
    }
    
    private function configureCategoriesIndex(Client $client)
    {
        $this->info('Configuring categories index...');
        $index = $client->index('categories');
        
        $index->updateSearchableAttributes([
            'name',
            'description'
        ]);
        
        $index->updateRankingRules([
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness'
        ]);
        
        $index->updateTypoTolerance([
            'enabled' => true,
            'minWordSizeForTypos' => [
                'oneTypo' => 4,
                'twoTypos' => 8
            ]
        ]);
        
        $this->info('Categories index configured');
    }
    
    private function configureTopicsIndex(Client $client)
    {
        $this->info('Configuring topics index...');
        $index = $client->index('topics');
        
        $index->updateSearchableAttributes([
            'title',
            'content',
            'category'
        ]);
        
        $index->updateRankingRules([
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness'
        ]);
        
        $index->updateTypoTolerance([
            'enabled' => true,
            'minWordSizeForTypos' => [
                'oneTypo' => 4,
                'twoTypos' => 8
            ]
        ]);
        
        $this->info('Topics index configured');
    }
}

