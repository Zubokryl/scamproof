<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Requests\CommentModerationRequest;
use App\Http\Resources\CommentResource;
use App\Models\Article;
use App\Models\ArticleComment;
use App\Services\CommentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Database\QueryException;

class ArticleCommentController extends Controller
{
    protected CommentService $service;

    public function __construct(CommentService $service)
    {
        $this->service = $service;
    }

    /**
     * Получить комментарии к статье (показываем все сразу)
     */
    public function index(Request $request, Article $article)
    {
        // Get pagination parameters
        $perPage = (int) $request->query('per_page', 20);
        $page = (int) $request->query('page', 1);
        
        // Remove the moderation check - show all comments to everyone
        // Use eager loading to avoid N+1 queries
        $comments = $article->comments()
            ->with(['user:id,name', 'likes', 'reactions'])
            ->select(['id', 'article_id', 'user_id', 'content', 'status', 'created_at', 'updated_at'])
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        return CommentResource::collection($comments);
    }

    /**
     * Создать комментарий (автоматически → approved)
     */
    public function store(CommentStoreRequest $request, Article $article)
    {
        // Get user ID or generate a guest identifier
        $userId = $request->user() ? $request->user()->id : null;
        
        $comment = $this->service->create($article, $userId, $request->validated());
        $comment->load('user:id,name');

        return response()->json([
            'comment' => new CommentResource($comment),
            'message' => 'Комментарий добавлен'
        ], 201);
    }

    /**
     * Удалить комментарий (автор, модератор или админ)
     */
    public function destroy(Request $request, ArticleComment $comment)
    {
        // Allow admins to delete any comment
        if ($request->user() && in_array($request->user()->role, ['admin', 'moderator'])) {
            $this->service->delete($comment);
            return response()->json(['message' => 'Comment deleted']);
        }
        
        // Allow users to delete their own comments
        if ($request->user() && $request->user()->id === $comment->user_id) {
            $this->service->delete($comment);
            return response()->json(['message' => 'Comment deleted']);
        }
        
        // For guest users, check if session matches
        if (!$request->user() && Session::getId() === $comment->session_id) {
            $this->service->delete($comment);
            return response()->json(['message' => 'Comment deleted']);
        }
        
        abort(403, 'Access denied');
    }

    // Методы модерации — предполагается middleware role:admin,moderator на маршрутах
    public function pending()
    {
        $comments = ArticleComment::pending()
            ->with(['user:id,name', 'article:id,title,slug'])
            ->select(['id', 'article_id', 'user_id', 'content', 'status', 'created_at', 'updated_at'])
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

    public function toggleLike(Request $request, ArticleComment $comment) {
        // Check if user is authenticated
        if ($request->user()) {
            // Authenticated user
            $like = \App\Models\CommentLike::where('comment_id', $comment->id)
                ->where('user_id', $request->user()->id)
                ->first();
        } else {
            // Guest user - use session ID
            $sessionId = Session::getId();
            $like = \App\Models\CommentLike::where('comment_id', $comment->id)
                ->where('session_id', $sessionId)
                ->first();
        }

        if ($like) {
            $like->delete();
            return response()->json(['liked' => false]);
        }

        try {
            if ($request->user()) {
                // Authenticated user
                \App\Models\CommentLike::create([
                    'comment_id' => $comment->id,
                    'user_id' => $request->user()->id,
                ]);
            } else {
                // Guest user
                \App\Models\CommentLike::create([
                    'comment_id' => $comment->id,
                    'session_id' => Session::getId(),
                ]);
            }
        } catch (QueryException $e) {
            // Handle duplicate entry error
            if ($e->getCode() == 23000) {
                // Duplicate entry, return success anyway since the like already exists
                return response()->json(['liked' => true]);
            }
            throw $e; // Re-throw if it's a different error
        }

        return response()->json(['liked' => true]);
    }
    
    public function toggleReaction(Request $request, ArticleComment $comment, $reactionType) {
        // Check if user is authenticated
        if ($request->user()) {
            // Authenticated user
            $reaction = \App\Models\CommentReaction::where('comment_id', $comment->id)
                ->where('user_id', $request->user()->id)
                ->where('reaction_type', $reactionType)
                ->first();
        } else {
            // Guest user - use session ID
            $sessionId = Session::getId();
            $reaction = \App\Models\CommentReaction::where('comment_id', $comment->id)
                ->where('session_id', $sessionId)
                ->where('reaction_type', $reactionType)
                ->first();
        }

        if ($reaction) {
            $reaction->delete();
            return response()->json(['removed' => true]);
        }

        try {
            if ($request->user()) {
                // Authenticated user
                \App\Models\CommentReaction::create([
                    'comment_id' => $comment->id,
                    'user_id' => $request->user()->id,
                    'reaction_type' => $reactionType,
                ]);
            } else {
                // Guest user
                \App\Models\CommentReaction::create([
                    'comment_id' => $comment->id,
                    'session_id' => Session::getId(),
                    'reaction_type' => $reactionType,
                ]);
            }
        } catch (QueryException $e) {
            // Handle duplicate entry error
            if ($e->getCode() == 23000) {
                // Duplicate entry, return success anyway since the reaction already exists
                return response()->json(['added' => true]);
            }
            throw $e; // Re-throw if it's a different error
        }

        return response()->json(['added' => true]);
    }
    
}