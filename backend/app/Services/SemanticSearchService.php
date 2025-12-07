<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use App\Models\ForumTopic;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SemanticSearchService
{
    /**
     * Russian medical synonyms dictionary
     * Maps user queries to related terms for better semantic matching
     */
    private array $synonyms = [
        'врач' => ['доктор', 'медик', 'специалист', 'терапевт', 'лечащий врач', 'врача', 'врачу', 'врачом'],
        'процедуры' => ['лечение', 'манипуляции', 'медицинские процедуры', 'терапия', 'обследование', 'процедур', 'процедура', 'процедуру'],
        'сомневаюсь' => ['не уверен', 'сомнения', 'не уверена', 'подозреваю', 'кажется', 'сомневаюсь', 'сомневаюсь'],
        'нужны' => ['необходимы', 'требуются', 'важны', 'важно', 'нужна', 'нужно', 'нужен'],
        'мошенничество' => ['обман', 'афера', 'мошенничество', 'надувательство', 'аферы', 'обмана'],
        'здравоохранение' => ['медицина', 'здоровье', 'медицинские услуги', 'медицинской', 'медицинское'],
        'лечение' => ['терапия', 'медицинская помощь', 'помощь врача', 'лечения', 'лечению'],
        'назначил' => ['назначила', 'назначили', 'назначение', 'назначения'],
        'несколько' => ['много', 'некоторые', 'ряд', 'некоторых'],
        'медицинских' => ['медицинские', 'медицинское', 'медицинская', 'медицине'],
        'учреждений' => ['учреждения', 'клиник', 'клиники', 'больниц', 'больницы'],
        'пациента' => ['пациенту', 'пациенте', 'больного', 'больному'],
    ];
    
    /**
     * Expand query with synonyms and related terms
     */
    private function expandQuery(string $query): array
    {
        $expanded = [$query]; // Always include original query
        $words = preg_split('/[\s\-—,\.]+/u', mb_strtolower(trim($query)));
        
        foreach ($words as $word) {
            $word = trim($word);
            if (mb_strlen($word) >= 3 && isset($this->synonyms[$word])) {
                $expanded = array_merge($expanded, $this->synonyms[$word]);
            }
        }
        
        return array_unique($expanded);
    }
    
    /**
     * Extract semantic meaning from query
     * Converts user intent into searchable terms
     */
    private function extractSemanticTerms(string $query): array
    {
        $query = mb_strtolower($query);
        $terms = [];
        
        // Medical context patterns - понимание смысла запросов
        if (preg_match('/врач.*процедур|процедур.*врач|назначил.*процедур|сомневаюсь.*процедур|врач.*назначил/i', $query)) {
            $terms[] = 'врач';
            $terms[] = 'процедуры';
            $terms[] = 'медицинские услуги';
            $terms[] = 'сомнения в лечении';
            $terms[] = 'назначение процедур';
        }
        
        if (preg_match('/мошенничеств|обман|афер|надувательств/i', $query)) {
            $terms[] = 'мошенничество';
            $terms[] = 'обман';
            $terms[] = 'признаки мошенничества';
            $terms[] = 'медицинские аферы';
        }
        
        if (preg_match('/здоровь|медицин|лечени|здравоохранени/i', $query)) {
            $terms[] = 'здравоохранение';
            $terms[] = 'медицина';
            $terms[] = 'медицинские услуги';
        }
        
        if (preg_match('/сомневаюсь|не уверен|сомнения|подозреваю/i', $query)) {
            $terms[] = 'сомнения';
            $terms[] = 'не уверен';
        }
        
        if (preg_match('/нужн|необходим|требует/i', $query)) {
            $terms[] = 'необходимость';
            $terms[] = 'нужно';
        }
        
        // Extract key nouns and important words
        $words = preg_split('/[\s\-—,\.]+/u', $query);
        foreach ($words as $word) {
            $word = trim($word);
            if (mb_strlen($word) >= 4) {
                $terms[] = $word;
            }
        }
        
        return array_unique($terms);
    }
    
    /**
     * Perform semantic search - understands context and meaning
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
        
        try {
            // Extract semantic terms from query
            $semanticTerms = $this->extractSemanticTerms($query);
            
            // Expand query with synonyms
            $expandedQueries = $this->expandQuery($query);
            
            // Collect all search results
            $allArticles = collect();
            
            // 1. Search with original query (highest priority)
            try {
                $articles = Article::search($query)->take(30)->get();
                // Mark these as exact matches
                $articles->each(function ($article) {
                    $article->is_exact_match = true;
                });
                $allArticles = $allArticles->merge($articles);
            } catch (\Exception $e) {
                Log::warning('Article search failed: ' . $e->getMessage());
            }
            
            // 2. Search with expanded queries (synonyms) - lower priority
            foreach (array_slice($expandedQueries, 0, 5) as $expandedQuery) {
                if ($expandedQuery !== $query) {
                    try {
                        $found = Article::search($expandedQuery)->take(10)->get();
                        // Mark these as synonym matches
                        $found->each(function ($article) {
                            if (!isset($article->is_exact_match)) {
                                $article->is_synonym_match = true;
                            }
                        });
                        $allArticles = $allArticles->merge($found);
                    } catch (\Exception $e) {
                        Log::warning('Expanded query search failed: ' . $e->getMessage());
                    }
                }
            }
            
            // 3. Search with semantic terms - lowest priority
            foreach (array_slice($semanticTerms, 0, 5) as $term) {
                try {
                    $found = Article::search($term)->take(10)->get();
                    // Mark these as semantic matches
                    $found->each(function ($article) {
                        if (!isset($article->is_exact_match) && !isset($article->is_synonym_match)) {
                            $article->is_semantic_match = true;
                        }
                    });
                    $allArticles = $allArticles->merge($found);
                } catch (\Exception $e) {
                    Log::warning('Semantic term search failed: ' . $e->getMessage());
                }
            }
            
            // 4. If still no results, try individual keywords
            if ($allArticles->isEmpty()) {
                $keywords = preg_split('/[\s\-—,\.]+/u', mb_strtolower($query));
                foreach ($keywords as $keyword) {
                    $keyword = trim($keyword);
                    if (mb_strlen($keyword) >= 3) {
                        try {
                            $found = Article::search($keyword)->take(10)->get();
                            $allArticles = $allArticles->merge($found);
                        } catch (\Exception $e) {
                            Log::warning('Keyword search failed: ' . $e->getMessage());
                        }
                    }
                }
            }
            
            // Remove duplicates and calculate relevance score
            $articles = $allArticles->unique('id')->map(function ($article) use ($query, $semanticTerms) {
                $article->relevance_score = $this->calculateRelevance($article, $query, $semanticTerms);
                return $article;
            })->sortByDesc('relevance_score')->take(30)->values();
            
            // Search categories and topics
            $categories = collect();
            $topics = collect();
            
            try {
                $categories = Category::search($query)->take(10)->get();
            } catch (\Exception $e) {
                Log::warning('Category search failed: ' . $e->getMessage());
            }
            
            try {
                $topics = ForumTopic::search($query)->take(20)->get();
            } catch (\Exception $e) {
                Log::warning('Forum topic search failed: ' . $e->getMessage());
            }
            
            return [
                'articles' => $articles,
                'categories' => $categories,
                'topics' => $topics,
            ];
        } catch (\Exception $e) {
            Log::error('Semantic search service error: ' . $e->getMessage());
            
            // Return empty results on error
            return [
                'articles' => collect([]),
                'categories' => collect([]),
                'topics' => collect([]),
            ];
        }
    }
    
    /**
     * Calculate relevance score based on semantic matching
     */
    private function calculateRelevance($article, string $query, array $semanticTerms): float
    {
        $score = 0.0;
        $content = mb_strtolower($article->content ?? '');
        $title = mb_strtolower($article->title ?? '');
        $queryLower = mb_strtolower($query);
        
        // Priority boosting based on match type
        if (isset($article->is_exact_match)) {
            $score += 100.0; // Highest priority for exact matches
        } elseif (isset($article->is_synonym_match)) {
            $score += 50.0; // Medium priority for synonym matches
        } elseif (isset($article->is_semantic_match)) {
            $score += 10.0; // Lower priority for semantic matches
        }
        
        // Exact phrase match in title (highest score)
        if (mb_strpos($title, $queryLower) !== false) {
            $score += 50.0;
        }
        
        // Exact phrase match in content
        if (mb_strpos($content, $queryLower) !== false) {
            $score += 25.0;
        }
        
        // Semantic terms matching
        foreach ($semanticTerms as $term) {
            $termLower = mb_strtolower($term);
            if (mb_strpos($title, $termLower) !== false) {
                $score += 15.0;
            }
            if (mb_strpos($content, $termLower) !== false) {
                $score += 7.5;
            }
        }
        
        // Word proximity bonus (if multiple query words appear close together)
        $queryWords = preg_split('/[\s\-—,\.]+/u', $queryLower);
        $queryWords = array_filter($queryWords, fn($w) => mb_strlen(trim($w)) >= 3);
        
        if (count($queryWords) > 1) {
            $foundWords = 0;
            foreach ($queryWords as $word) {
                if (mb_strpos($content, $word) !== false || mb_strpos($title, $word) !== false) {
                    $foundWords++;
                }
            }
            // Bonus for finding multiple words from query
            if ($foundWords > 0) {
                $score += ($foundWords / count($queryWords)) * 10.0;
            }
        }
        
        return $score;
    }
}