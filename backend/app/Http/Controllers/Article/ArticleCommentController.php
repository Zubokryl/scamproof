<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommentModerationRequest;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Resources\CommentResource;
use App\Models\Article;
use App\Models\ArticleComment;
use App\Services\CommentService;
use Illuminate\Http\Request;

class ArticleCommentController extends Controller
{
    protected CommentService $service;

    public function __construct(CommentService $service)
    {
        $this->service = $service;
        // Для модерации применяйте middleware role:admin,moderator в routes
    }

    /**
     * Получить комментарии к статье
     */
    public function index(Request $request, Article $article)
    {
        $query = $article->comments()->with('user:id,name');

        if (! (auth()->check() && in_array(auth()->user()->role, ['admin', 'moderator']))) {
            $query->approved();
        }

        $comments = $query->latest()->paginate(20);

        return CommentResource::collection($comments);
    }

    /**
     * Создать комментарий (автоматически → pending)
     */
    public function store(CommentStoreRequest $request, Article $article)
    {
        $comment = $this->service->create($article, $request->user()->id, $request->validated());
        $comment->load('user');

        return response()->json([
            'comment' => new CommentResource($comment),
            'message' => 'Комментарий отправлен на модерацию'
        ], 201);
    }

    /**
     * Удалить комментарий (автор, модератор или админ)
     */
    public function destroy(Request $request, ArticleComment $comment)
    {
        if ($request->user()->id !== $comment->user_id
            && ! in_array($request->user()->role, ['admin', 'moderator'])) {
            abort(403, 'Access denied');
        }

        $this->service->delete($comment);

        return response()->json(['message' => 'Comment deleted']);
    }

    // Методы модерации — предполагается middleware role:admin,moderator на маршрутах
    public function pending()
    {
        $comments = ArticleComment::pending()
            ->with(['user', 'article:id,title,slug'])
            ->latest()
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    public function approve(CommentModerationRequest $request, ArticleComment $comment)
    {
        $data = $request->validated();
        $comment = $this->service->approve($comment, $request->user()->id, $data['note'] ?? null);

        return response()->json([
            'message' => 'Комментарий одобрен',
            'comment' => new CommentResource($comment)
        ]);
    }

    public function reject(CommentModerationRequest $request, ArticleComment $comment)
    {
        $data = $request->validated();
        if (empty($data['note'])) {
            return response()->json(['message' => 'Note is required for rejection'], 422);
        }

        $comment = $this->service->reject($comment, $request->user()->id, $data['note']);

        return response()->json([
            'message' => 'Комментарий отклонен',
            'comment' => new CommentResource($comment)
        ]);
    }

    public function moderationStats()
    {
        $stats = [
            'pending'        => ArticleComment::pending()->count(),
            'approved_today' => ArticleComment::approved()
                ->whereDate('moderated_at', today())->count(),
            'rejected_today' => ArticleComment::rejected()
                ->whereDate('moderated_at', today())->count(),
        ];

        return response()->json($stats);
    }
}