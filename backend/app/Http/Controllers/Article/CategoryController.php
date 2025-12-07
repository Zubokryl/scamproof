<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    protected CategoryService $service;

    public function __construct(CategoryService $service)
    {
        $this->service = $service;
    }

    // GET /categories
    public function index(Request $request)
    {
        $query = Category::withCount([
            'articles' => function ($q) {
                $q->published();
            },
            'forumTopics'
        ]);

        if ($request->boolean('for_homepage')) {
            $query->forHomepage();
        }

        return response()->json($query->orderBy('name')->get());
    }

    // GET /categories/{slug}
    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->withCount(['articles' => fn($q) => $q->published(), 'forumTopics'])
            ->firstOrFail();

        return response()->json($category);
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
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'landing_enabled' => (bool) $category->landing_enabled,
                'articles_count' => $category->articles_count,
                'seo' => [
                    'title' => $category->meta_title ?? $category->name,
                    'description' => $category->meta_description ?? substr($category->description, 0, 160),
                    'keywords' => $category->meta_keywords ?? null,
                ],
            ],
            'recent_articles' => $recentArticles,
        ]);
    }
    
    // GET /categories/{slug}/articles - For paginated articles in landing page
    public function articles($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        
        $perPage = (int) $request->query('per_page', 9);
        $page = (int) $request->query('page', 1);
        
        $articles = $category->articles()
            ->published()
            ->withCount(['likes', 'comments'])
            ->latest('published_at')
            ->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'landing_enabled' => (bool) $category->landing_enabled,
                'articles_count' => $category->articles()->published()->count(),
                'seo' => [
                    'title' => $category->meta_title ?? $category->name,
                    'description' => $category->meta_description ?? substr($category->description, 0, 160),
                    'keywords' => $category->meta_keywords ?? null,
                ],
            ],
            'articles' => $articles,
            'articles_count' => $category->articles()->published()->count()
        ]);
    }

    // POST /categories (admin)
    public function store(CategoryStoreRequest $request)
    {
        $category = $this->service->create($request->validated());
        return response()->json($category, 201);
    }

    // PUT/PATCH /categories/{id} (admin)
    public function update(CategoryUpdateRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category = $this->service->update($category, $request->validated());
        return response()->json($category);
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

        return response()->json($categories);
    }
}