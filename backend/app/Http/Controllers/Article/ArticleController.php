<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\ArticleUpdateRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Services\ArticleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        Log::info('Admin authorization check', [
            'user' => $user ? $user->toArray() : null,
            'user_role' => $user ? $user->role : null,
            'is_admin' => $user && $user->role === 'admin'
        ]);
        
        if (!$user || $user->role !== 'admin') {
            Log::warning('Admin authorization failed', [
                'user_id' => $user ? $user->id : null,
                'user_role' => $user ? $user->role : null
            ]);
            abort(403, 'Access denied. Admin role required.');
        }
        
        Log::info('Admin authorization successful');
    }

    /**
     * GET /articles
     */
    public function index(Request $request)
    {
        Log::info('Article index method called');
        
        $perPage = (int) $request->query('per_page', 15);

        $query = Article::query()
            ->published() // предполагается scopePublished / scopeApproved реализован в модели
            ->with(['category', 'author'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('published_at');

        // Простейшая фильтрация по категории/поиску (опционально)
        if ($category = $request->query('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $category));
        }

        if ($q = $request->query('q')) {
            $query->where(function ($qry) use ($q) {
                $qry->where('title', 'like', '%' . str_replace(['%','_'], ['\%','\_'], $q) . '%')
                    ->orWhere('content', 'like', '%' . str_replace(['%','_'], ['\%','\_'], $q) . '%');
            });
        }

        $articles = $query->paginate($perPage);
        
        Log::info('Articles found', [
            'count' => $articles->count(),
            'total' => $articles->total(),
            'per_page' => $articles->perPage(),
            'current_page' => $articles->currentPage()
        ]);

        return ArticleResource::collection($articles);
    }

    /**
     * POST /articles
     */
    public function store(ArticleStoreRequest $request)
    {
        // Authorize admin
        $this->authorizeAdmin($request);
        
        Log::info('Article store request received', [
            'user' => $request->user() ? $request->user()->toArray() : null,
            'validated_data' => $request->validated(),
            'all_data' => $request->all()
        ]);
        
        try {
            $article = $this->service->create($request);
            $article->load(['category', 'author']);

            return new ArticleResource($article);
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
     */
    public function show(Article $article)
    {
        Log::info('Article show method called', [
            'article_id' => $article->id,
            'article_exists' => $article->exists
        ]);
        
        $article->load(['category', 'author']);
        return new ArticleResource($article);
    }

    /**
     * PUT/PATCH /articles/{article}
     */
    public function update(ArticleUpdateRequest $request, Article $article)
    {
        // Authorize admin
        $this->authorizeAdmin($request);
        
        // Debug route model binding
        Log::info('Route model binding debug', [
            'article_id_from_route' => $request->route('article'),
            'article_model_instance' => $article,
            'article_exists' => $article->exists,
            'article_id' => $article->id
        ]);
        
        Log::info('Article update request received', [
            'article_id' => $article->id,
            'user' => $request->user() ? $request->user()->toArray() : null,
            'validated_data' => $request->validated(),
            'all_data' => $request->all(),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'request_keys' => array_keys($request->all())
        ]);
        
        // Add a simple test to verify the request is working
        if ($request->has('test_mode')) {
            Log::info('Test mode activated - returning test response');
            return response()->json([
                'message' => 'Test successful',
                'article_id' => $article->id,
                'received_data' => $request->all()
            ]);
        }
        
        try {
            // Log the article state before update
            Log::info('Article state before update', [
                'article_id' => $article->id,
                'title_before' => $article->title,
                'content_before' => $article->content,
                'category_id_before' => $article->category_id
            ]);
            
            $updatedArticle = $this->service->update($article, $request);
            
            // CRITICAL: Log the actual updated article data
            Log::info('Article after service update', [
                'article_id' => $updatedArticle->id,
                'title_after_service' => $updatedArticle->title,
                'content_after_service' => $updatedArticle->content,
                'category_id_after_service' => $updatedArticle->category_id
            ]);
            
            $updatedArticle->load(['category', 'author']);
            
            // CRITICAL: Log the article data before sending response
            Log::info('Article data before sending response', [
                'article_id' => $updatedArticle->id,
                'title_before_response' => $updatedArticle->title,
                'content_before_response' => $updatedArticle->content,
                'category_before_response' => $updatedArticle->category,
                'category_loaded' => $updatedArticle->relationLoaded('category'),
                'author_loaded' => $updatedArticle->relationLoaded('author')
            ]);

            $response = new ArticleResource($updatedArticle);
            Log::info('ArticleResource created', [
                'resource_data' => $response->toArray(request())
            ]);

            return $response;
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
    public function destroy(Request $request, Article $article)
    {
        // Authorize admin
        $this->authorizeAdmin($request);
        
        try {
            $this->service->delete($article);
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