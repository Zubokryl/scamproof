<?php

require_once 'vendor/autoload.php';

use Meilisearch\Client;

// Initialize Meilisearch client
$client = new Client('http://localhost:7700', 'masterKey');

// Import articles
echo "Importing articles...\n";
$articlesIndex = $client->index('articles');
$articles = json_decode(file_get_contents('storage/app/search_data/articles.json'), true);
$articlesIndex->addDocuments($articles);
echo "Articles imported: " . count($articles) . "\n";

// Import categories
echo "Importing categories...\n";
$categoriesIndex = $client->index('categories');
$categories = json_decode(file_get_contents('storage/app/search_data/categories.json'), true);
$categoriesIndex->addDocuments($categories);
echo "Categories imported: " . count($categories) . "\n";

// Import forum topics
echo "Importing forum topics...\n";
$topicsIndex = $client->index('topics');
$topics = json_decode(file_get_contents('storage/app/search_data/topics.json'), true);
$topicsIndex->addDocuments($topics);
echo "Topics imported: " . count($topics) . "\n";

echo "All data imported successfully!\n";