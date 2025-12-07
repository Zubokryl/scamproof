<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\ArticleUpdateRequest;
use App\Models\Article;
use App\Services\ArticleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\ArticleResource;

class ArticleController extends Controller
{
    protected ArticleService $service;

    public function __construct(ArticleService $service)
    {
        $this->service = $service;
    }

    public function authorizeAdmin($request)
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Access denied. Admin role required.');
        }
    }

    /**
     * GET /articles
     * 
     * CRITICAL: DO NOT MODIFY THE withCount() CALLS! This is essential for like/comment functionality.
     * 
     * The withCount(['likes', 'comments']) is required for the frontend to display correct counts.
     * Removing or modifying this will break the like/comment display functionality.
     * Both authenticated users and guests should only be able to like an article ONCE.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);

        $query = Article::query()
            ->with(['category:id,name,slug', 'author:id,name'])
            ->withCount(['likes', 'comments']) // Add counts for frontend display
            ->select(['id', 'title', 'slug', 'content', 'category_id', 'created_by', 'published_at', 'thumbnail', 'video_url', 'pdf_url']); // Removed views_count - column doesn't exist in DB

        // Filter by category if provided
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by search term if provided
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Published articles only for non-admins
        if (!$request->user() || $request->user()->role !== 'admin') {
            $query->published();
        }

        $articles = $query->latest('published_at')->paginate($perPage);

        return response()->json($articles);
    }

    /**
     * POST /articles
     */
    public function store(ArticleStoreRequest $request)
    {
        try {
            $this->authorizeAdmin($request);
            
            $article = $this->service->create($request);
            $article->load(['category:id,name,slug', 'author:id,name']);

            return response()->json($article);
        } catch (\Exception $e) {
            Log::error('Article store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to create article'], 500);
        }
    }

    /**
     * GET /articles/{article}
     * 
     * CRITICAL: DO NOT MODIFY THIS METHOD! This is the core of the like persistence functionality.
     * 
     * This method must use ArticleResource to properly add user_has_liked/guest_has_liked
     * properties for the frontend. Do not change this to return raw JSON as it will break
     * the like functionality persistence across page reloads.
     * 
     * The ArticleResource adds:
     * - user_has_liked: For authenticated users, checks if they've liked the article
     * - guest_has_liked: For guest users, checks if their session has liked the article
     * 
     * Both authenticated users and guests should only be able to like an article ONCE.
     * Any changes to this method MUST preserve this one-like-per-user functionality.
     * 
     * IMPORTANT: The return MUST use "new ArticleResource($article)" to ensure proper
     * like state detection for both authenticated users and guests.
     */
    public function show($identifier)
    {
        // Use caching for better performance
        $cacheKey = "article_show_" . (is_numeric($identifier) ? "id_{$identifier}" : "slug_{$identifier}");
        
        $article = Cache::remember($cacheKey, 300, function () use ($identifier) {
            // Handle both ID and slug with eager loading and counts
            $query = Article::query()
                ->with(['category:id,name,slug', 'author:id,name'])
                ->withCount(['likes', 'comments']) // Add counts for frontend display
                ->select(['id', 'title', 'slug', 'content', 'category_id', 'created_by', 'published_at', 'thumbnail', 'video_url', 'pdf_url']); // Removed views_count - column doesn't exist in DB
            
            $article = is_numeric($identifier) 
                ? $query->findOrFail($identifier)
                : $query->where('slug', $identifier)->firstOrFail();
            
            return $article;
        });
        
        // Return the article through the ArticleResource to add user_has_liked/guest_has_liked
        // IMPORTANT: Do not change this to raw JSON response as it will break like persistence
        // CRITICAL: This MUST use ArticleResource to ensure proper like state detection
        return new ArticleResource($article);
    }

    /**
     * PUT/PATCH /articles/{article}
     */
    public function update(ArticleUpdateRequest $request, $identifier)
    {
        // Authorize admin
        $this->authorizeAdmin($request);
        
        // Handle both ID and slug for updates
        $article = is_numeric($identifier) 
            ? Article::findOrFail($identifier)
            : Article::where('slug', $identifier)->firstOrFail();
        
        try {
            $updatedArticle = $this->service->update($article, $request);
            $updatedArticle->load(['category:id,name,slug', 'author:id,name']);
            
            // Clear cache when article is updated
            Cache::forget("article_show_id_{$updatedArticle->id}");
            Cache::forget("article_show_slug_{$updatedArticle->slug}");

            return response()->json($updatedArticle);
        } catch (\Exception $e) {
            Log::error('Article update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to update article'], 500);
        }
    }

    /**
     * DELETE /articles/{article}
     */
    public function destroy(Request $request, $identifier)
    {
        // Authorize admin
        $this->authorizeAdmin($request);
        
        // Handle both ID and slug for deletion
        $article = is_numeric($identifier) 
            ? Article::findOrFail($identifier)
            : Article::where('slug', $identifier)->firstOrFail();
        
        try {
            $this->service->delete($article);
            
            // Clear cache when article is deleted
            Cache::forget("article_show_id_{$article->id}");
            Cache::forget("article_show_slug_{$article->slug}");
            
            return response()->noContent();
        } catch (\Exception $e) {
            Log::error('Article delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to delete article'], 500);
        }
    }

    /**
     * GET /search
     * 
     * Advanced search with relevance scoring for articles, categories, and forum topics
     */
    public function search(Request $request)
    {
        $query = $request->query('q');
        $type = $request->query('type', 'keyword');
        
        if (!$query) {
            return response()->json([
                'articles' => [],
                'categories' => [],
                'forum_topics' => [],
                'total' => 0
            ]);
        }
        
        // Search articles
        $articles = $this->searchArticles($query, $type);
        
        // Search categories
        $categories = $this->searchCategories($query);
        
        // Search forum topics (when implemented)
        $forumTopics = [];
        
        $totalResults = count($articles) + count($categories) + count($forumTopics);
        
        return response()->json([
            'articles' => $articles,
            'categories' => $categories,
            'forum_topics' => $forumTopics,
            'total' => $totalResults,
            'query' => $query,
            'type' => $type
        ]);
    }
    
    /**
     * Search articles with relevance scoring
     */
    private function searchArticles($query, $type)
    {
        $articleQuery = \App\Models\Article::query()
            ->with(['category:id,name,slug', 'author:id,name'])
            ->withCount(['likes', 'comments'])
            ->published()
            ->select(['id', 'title', 'slug', 'content', 'category_id', 'created_by', 'published_at', 'thumbnail', 'video_url', 'pdf_url']);
            
        switch ($type) {
            case 'type':
                // Search by article type/content with improved relevance
                $articleQuery->where(function ($q) use ($query) {
                    $q->where('content', 'like', "%{$query}%")
                      ->orWhere('title', 'like', "%{$query}%");
                });
                break;
                
            case 'channel':
                // Search by channel (category) with improved matching
                $articleQuery->whereHas('category', function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('slug', 'like', "%{$query}%");
                });
                break;
                
            case 'category':
                // Search by category name with improved matching
                $articleQuery->whereHas('category', function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('slug', 'like', "%{$query}%");
                });
                break;
                
            case 'keyword':
            default:
                // Improved keyword search with multiple strategies
                $articleQuery->where(function ($q) use ($query) {
                    // Exact phrase match (highest priority)
                    $q->where(function ($subQ) use ($query) {
                        $subQ->where('title', 'like', "%{$query}%")
                             ->orWhere('content', 'like', "%{$query}%");
                    });
                    
                    // Word-by-word matching for better relevance
                    $words = explode(' ', $query);
                    foreach ($words as $word) {
                        if (strlen($word) > 2) { // Only consider words longer than 2 characters
                            $q->orWhere('title', 'like', "%{$word}%")
                              ->orWhere('content', 'like', "%{$word}%");
                        }
                    }
                });
                break;
        }
        
        // Get articles
        $articles = $articleQuery->limit(30)->get();
        
        // Score and sort articles by relevance
        $articles = $articles->map(function ($article) use ($query) {
            $article->relevance_score = $this->calculateRelevanceScore($article, $query);
            return $article;
        })->sortByDesc('relevance_score')->values();
        
        return $articles;
    }
    
    /**
     * Search categories with relevance scoring
     */
    private function searchCategories($query)
    {
        $categoryQuery = \App\Models\Category::query()
            ->select(['id', 'name', 'description', 'slug', 'icon']);
            
        // Search in category name and description
        $categoryQuery->where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('description', 'like', "%{$query}%");
        });
        
        // Get categories
        $categories = $categoryQuery->limit(10)->get();
        
        // Score and sort categories by relevance
        $categories = $categories->map(function ($category) use ($query) {
            $category->relevance_score = $this->calculateCategoryRelevanceScore($category, $query);
            return $category;
        })->sortByDesc('relevance_score')->values();
        
        return $categories;
    }
    
    /**
     * Calculate relevance score for articles
     */
    private function calculateRelevanceScore($article, $query)
    {
        $score = 0;
        
        // Title match scoring (highest weight)
        if (stripos($article->title, $query) !== false) {
            $score += 20; // Exact phrase match in title
            
            // Count occurrences
            $titleCount = substr_count(strtolower($article->title), strtolower($query));
            $score += $titleCount * 5;
        }
        
        // Content match scoring
        if (stripos($article->content, $query) !== false) {
            $score += 10; // Exact phrase match in content
            
            // Count occurrences
            $contentCount = substr_count(strtolower($article->content), strtolower($query));
            $score += $contentCount * 2;
        }
        
        // Word frequency scoring
        $words = explode(' ', $query);
        foreach ($words as $word) {
            if (strlen($word) > 2) {
                $titleWordCount = substr_count(strtolower($article->title), strtolower($word));
                $contentWordCount = substr_count(strtolower($article->content), strtolower($word));
                $score += ($titleWordCount * 3) + ($contentWordCount * 1);
            }
        }
        
        // Boost for categories that match the query
        if ($article->category && (stripos($article->category->name, $query) !== false)) {
            $score += 5;
        }
        
        return $score;
    }
    
    /**
     * Calculate relevance score for categories
     */
    private function calculateCategoryRelevanceScore($category, $query)
    {
        $score = 0;
        
        // Name match scoring (highest weight)
        if (stripos($category->name, $query) !== false) {
            $score += 15; // Exact phrase match in name
            
            // Count occurrences
            $nameCount = substr_count(strtolower($category->name), strtolower($query));
            $score += $nameCount * 3;
        }
        
        // Description match scoring
        if (stripos($category->description, $query) !== false) {
            $score += 8; // Exact phrase match in description
            
            // Count occurrences
            $descriptionCount = substr_count(strtolower($category->description), strtolower($query));
            $score += $descriptionCount * 1;
        }
        
        // Word frequency scoring
        $words = explode(' ', $query);
        foreach ($words as $word) {
            if (strlen($word) > 2) {
                $nameWordCount = substr_count(strtolower($category->name), strtolower($word));
                $descriptionWordCount = substr_count(strtolower($category->description), strtolower($word));
                $score += ($nameWordCount * 2) + ($descriptionWordCount * 1);
            }
        }
        
        return $score;
    }
}