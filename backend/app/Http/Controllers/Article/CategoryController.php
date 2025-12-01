<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected CategoryService $service;

    public function __construct(CategoryService $service)
    {
        $this->service = $service;
        // Примечание: для админских методов применяйте middleware в routes (см. заметки)
    }

    // GET /categories
    public function index(Request $request)
    {
        $query = Category::withCount(['articles' => function ($q) {
            $q->published();
        }]);

        if ($request->boolean('for_homepage')) {
            $query->forHomepage();
        }

        // Пагинация может быть добавлена при необходимости; сейчас возвращаем полный список
        return CategoryResource::collection($query->orderBy('name')->get());
    }

    // GET /categories/{slug}
    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->with([
                'articles' => function ($q) {
                    $q->published()->latest('published_at');
                }
            ])
            ->withCount(['articles' => fn($q) => $q->published(), 'forumTopics'])
            ->firstOrFail();

        return new CategoryResource($category);
    }

    // GET /categories/{slug}/landing
    public function showLanding($slug)
    {
        $category = Category::where('slug', $slug)
            ->where('landing_enabled', true)
            ->withCount(['articles', 'forumTopics'])
            ->firstOrFail();

        $recentArticles = $category->articles()
            ->published()
            ->latest('published_at')
            ->limit(6)
            ->get();

        return response()->json([
            'category' => new CategoryResource($category),
            'recent_articles' => \App\Http\Resources\ArticleResource::collection($recentArticles),
        ]);
    }
    
    // GET /categories/{slug}/articles - For paginated articles in landing page
    public function articles($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        
        $perPage = (int) $request->query('per_page', 9); // Default 9 articles per page for grid layout
        $page = (int) $request->query('page', 1);
        
        $articles = $category->articles()
            ->published()
            ->with(['author', 'category'])
            ->withCount(['likes', 'comments'])
            ->latest('published_at')
            ->paginate($perPage, ['*'], 'page', $page);
        
        // Include category information in the response
        return response()->json([
            'category' => new CategoryResource($category),
            'articles' => $articles,
            'articles_count' => $category->articles()->published()->count()
        ]);
    }

    // POST /categories (admin)
    public function store(CategoryStoreRequest $request)
    {
        $category = $this->service->create($request->validated());
        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    // PUT/PATCH /categories/{id} (admin)
    public function update(CategoryUpdateRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category = $this->service->update($category, $request->validated());

        return new CategoryResource($category);
    }

    // DELETE /categories/{id} (admin)
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->articles()->count() > 0) {
            return response()->json(['message' => 'Нельзя удалить категорию, в которой есть статьи'], 422);
        }

        $this->service->delete($category);

        return response()->json(['message' => 'Category deleted']);
    }

    // GET /categories/with-landings
    public function withLandings()
    {
        $categories = Category::withLanding()
            ->withCount(['articles' => function ($q) {
                $q->published();
            }])
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }
}