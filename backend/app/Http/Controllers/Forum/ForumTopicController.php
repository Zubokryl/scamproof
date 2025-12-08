<?php

namespace App\Http\Controllers\Forum;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForumTopicStoreRequest;
use App\Http\Resources\ForumTopicResource;
use App\Http\Resources\ForumReplyResource;
use App\Models\ForumTopic;
use App\Models\ForumTopicLike;
use App\Models\Category;
use App\Services\ForumTopicService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ForumTopicController extends Controller
{
    protected ForumTopicService $service;

    public function __construct(ForumTopicService $service)
    {
        $this->service = $service;
    }

    /**
     * Список публичных/approved тем с пагинацией.
     */
    public function index(Request $request)
    {
        $query = ForumTopic::query()
            ->with('author:id,name', 'category:id,name,slug')
            ->withCount('replies')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        return ForumTopicResource::collection($query->paginate(15));
    }

    /**
     * Получить темы по категории
     */
    public function byCategory($categorySlug)
    {
        // Для категории "other" показываем темы без категории
        if ($categorySlug === 'other') {
            $topics = ForumTopic::whereNull('category_id')
                ->with('author:id,name', 'category:id,name,slug')
                ->withCount('replies')
                ->orderByDesc('is_pinned')
                ->orderByDesc('created_at')
                ->get();
        } else {
            // Для остальных категорий фильтруем по slug
            $category = Category::where('slug', $categorySlug)->first();
            
            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }
            
            $topics = ForumTopic::where('category_id', $category->id)
                ->with('author:id,name', 'category:id,name,slug')
                ->withCount('replies')
                ->orderByDesc('is_pinned')
                ->orderByDesc('created_at')
                ->get();
        }

        return ForumTopicResource::collection($topics);
    }

    /**
     * Получить последние созданные темы (10 штук)
     */
    public function latest()
    {
        $topics = ForumTopic::with('author:id,name', 'category:id,name,slug')
            ->withCount('replies')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return ForumTopicResource::collection($topics);
    }

    /**
     * Показать тему
     */
    public function show($slug)
    {
        $topic = ForumTopic::where('slug', $slug)
            ->with('author:id,name', 'category:id,name,slug')
            ->firstOrFail();


        // подгружаем последние 20 ответов отдельно — чтобы не ломать пагинацию в ресурсе
        $recentReplies = $topic->replies()->with('author:id,name', 'children.author:id,name')->latest()->limit(20)->get();
        $topic->setRelation('recentReplies', ForumReplyResource::collection($recentReplies));

        return new ForumTopicResource($topic);
    }

    /**
     * Создать тему — сразу видимая (approved). Т.к. валидация вынесена в FormRequest,
     * здесь остаётся только orchestration.
     */
    public function store(ForumTopicStoreRequest $request)
    {
        $topic = $this->service->create($request->validated(), $request->user());
        $topic->load('author', 'category');

        return (new ForumTopicResource($topic))->response()->setStatusCode(201);
    }

    /**
     * Обновить тему
     */
    public function update(Request $request, ForumTopic $topic)
    {
        // Проверяем право текущего пользователя обновлять тему
        $this->authorize('update', $topic);

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'category_id' => 'nullable|exists:categories,id',
            'is_pinned' => 'sometimes|boolean',
        ]);

        // Если изменился заголовок — пересоздаём уникальный slug
        if (isset($data['title'])) {
            $base = Str::slug($data['title']) ?: Str::random(8);
            $slug = $base;
            $i = 1;
            while (ForumTopic::where('slug', $slug)->where('id', '<>', $topic->id)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $data['slug'] = $slug;
        }

        $topic->fill($data);
        $topic->save();

        $topic->load('author', 'category');

        return new ForumTopicResource($topic->fresh());
    }

    /**
     * Удалить тему
     */
    public function destroy(Request $request, ForumTopic $topic)
    {
        // Проверяем право текущего пользователя удалять тему
        $this->authorize('delete', $topic);

        // Удаляем через сервис (soft/hard зависит от реализации)
        $this->service->delete($topic);

        return response()->json(['message' => 'Topic deleted']);
    }

    /**
     * Toggle like for a topic
     */
    public function toggleLike(ForumTopic $topic)
    {
        $user = Auth::user();
        
        // Check if user has already liked this topic
        $existingLike = $topic->likes()->where('user_id', $user->id)->first();
        
        if ($existingLike) {
            // Unlike
            $existingLike->delete();
            $topic->decrement('likes_count');
            $liked = false;
        } else {
            // Like
            $topic->likes()->create(['user_id' => $user->id]);
            $topic->increment('likes_count');
            $liked = true;
        }
        
        return response()->json([
            'liked' => $liked,
            'likes_count' => $topic->likes_count
        ]);
    }

    /**
     * Search forum topics by query
     */
    public function search(Request $request)
    {
        $query = trim($request->get('q', ''));
        
        if (empty($query)) {
            return response()->json([]);
        }
        
        // Simple database search for forum topics
        $topics = ForumTopic::with('author:id,name', 'category:id,name,slug')
            ->withCount('replies')
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('content', 'LIKE', "%{$query}%");
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();
            
        return ForumTopicResource::collection($topics);
    }
}