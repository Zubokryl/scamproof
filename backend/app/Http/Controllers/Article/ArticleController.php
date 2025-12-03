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
}