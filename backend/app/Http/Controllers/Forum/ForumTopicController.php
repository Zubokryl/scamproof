<?php

namespace App\Http\Controllers\Forum;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForumTopicStoreRequest;
use App\Http\Resources\ForumTopicResource;
use App\Models\ForumTopic;
use App\Services\ForumTopicService;
use Illuminate\Http\Request;
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
            ->with('author:id,name')
            ->withCount('replies')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        return ForumTopicResource::collection($query->paginate(15));
    }

    /**
     * Показать тему
     */
    public function show($slug)
    {
        $topic = ForumTopic::where('slug', $slug)
            ->with('author:id,name')
            ->firstOrFail();


        // подгружаем последние 20 ответов отдельно — чтобы не ломать пагинацию в ресурсе
        $recentReplies = $topic->replies()->with('author:id,name')->latest()->limit(20)->get();
        $topic->setRelation('recentReplies', $recentReplies);

        return new ForumTopicResource($topic);
    }

    /**
     * Создать тему — сразу видимая (approved). Т.к. валидация вынесена в FormRequest,
     * здесь остаётся только orchestration.
     */
    public function store(ForumTopicStoreRequest $request)
    {
        $topic = $this->service->create($request->validated(), $request->user());
        $topic->load('author');

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
            'section_slug' => 'nullable|string|max:100|exists:forum_sections,slug',
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

        $topic->load('author');

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
}