<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use App\Models\ForumTopic;

class SearchService
{
    /**
     * Extract keywords from search query for better matching
     */
    private function extractKeywords(string $query): array
    {
        // Remove common stop words in Russian
        $stopWords = ['и', 'в', 'на', 'с', 'по', 'для', 'от', 'до', 'за', 'из', 'к', 'о', 'об', 'со', 'то', 'что', 'как', 'где', 'когда', 'ли', 'мне', 'меня', 'мой', 'моя', 'мое', 'мы', 'нас', 'наш', 'наша', 'наше'];
        
        // Clean and split query
        $words = preg_split('/[\s\-—,\.]+/u', mb_strtolower($query));
        
        // Filter out stop words and short words
        $keywords = array_filter($words, function ($word) use ($stopWords) {
            return mb_strlen($word) >= 3 && !in_array($word, $stopWords);
        });
        
        return array_values($keywords);
    }
    
    /**
     * Perform intelligent search across all models
     */
    public function search(string $query): array
    {
        $query = trim($query);
        
        if (empty($query)) {
            return [
                'articles' => collect([]),
                'categories' => collect([]),
                'topics' => collect([]),
            ];
        }
        
        // Extract keywords for potential fallback search
        $keywords = $this->extractKeywords($query);
        
        // Meilisearch by default searches for all words, but if words are far apart,
        // it might not find the document. We'll use a smarter approach:
        // 1. First try the full query
        $articles = Article::search($query)->take(30)->get();
        
        // 2. If no results, try searching with individual keywords and combine results
        // This ensures we find documents containing any of the search terms
        if ($articles->isEmpty() && !empty($keywords)) {
            $allArticles = collect();
            foreach (array_slice($keywords, 0, 5) as $keyword) {
                $found = Article::search($keyword)->take(10)->get();
                $allArticles = $allArticles->merge($found);
            }
            // Remove duplicates and sort by relevance (articles matching more keywords first)
            $articles = $allArticles->unique('id')->map(function ($article) use ($keywords) {
                $article->relevance_score = 0;
                $content = mb_strtolower($article->content ?? '');
                $title = mb_strtolower($article->title ?? '');
                foreach ($keywords as $keyword) {
                    if (mb_strpos($content, $keyword) !== false || mb_strpos($title, $keyword) !== false) {
                        $article->relevance_score++;
                    }
                }
                return $article;
            })->sortByDesc('relevance_score')->take(30)->values();
        }
        
        $categories = Category::search($query)->take(10)->get();
        $topics = ForumTopic::search($query)->take(20)->get();
        
        return [
            'articles' => $articles,
            'categories' => $categories,
            'topics' => $topics,
        ];
    }
}

