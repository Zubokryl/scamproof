<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\ArticleUpdateRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Services\ArticleService;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    protected ArticleService $service;

    public function __construct(ArticleService $service)
    {
        $this->service = $service;
        // Middleware для прав (auth / role) оставить на маршрутах
    }

    /**
     * GET /articles
     */
    public function index(Request $request)
    {
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

        return ArticleResource::collection($articles);
    }

    /**
     * POST /articles
     */
    public function store(ArticleStoreRequest $request)
    {
        $article = $this->service->create($request->validated());
        $article->load(['category', 'author']);

        return (new ArticleResource($article))->response()->setStatusCode(201);
    }

    /**
     * GET /articles/{article:slug}
     */
    public function show(Article $article)
    {
        $article->load(['category', 'author']);
        return new ArticleResource($article);
    }

    /**
     * PUT/PATCH /articles/{article}
     */
    public function update(ArticleUpdateRequest $request, Article $article)
    {
        $article = $this->service->update($article, $request->validated());
        $article->load(['category', 'author']);

        return new ArticleResource($article);
    }

    /**
     * DELETE /articles/{article}
     */
    public function destroy(Article $article)
    {
        $this->service->delete($article);
        return response()->noContent();
    }
}
