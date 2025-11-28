<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleComment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CommentService
{
    /**
     * Создать комментарий (ставится pending) и инвалидация кеша.
     */
    public function create(Article $article, $userId, array $data): ArticleComment
    {
        return DB::transaction(function () use ($article, $userId, $data) {
            $comment = ArticleComment::create([
                'article_id' => $article->id,
                'user_id' => $userId,
                'content' => $data['content'],
                'status' => 'pending',
            ]);
            Cache::tags(['articles', 'comments'])->flush();
            return $comment;
        });
    }

    /**
     * Удаление комментария с инвалидацией кэша.
     */
    public function delete(ArticleComment $comment): void
    {
        DB::transaction(function () use ($comment) {
            $comment->delete();
            Cache::tags(['articles', 'comments'])->flush();
        });
    }

    /**
     * Одобрить комментарий — устанавливает поля и инвалидацию.
     */
    public function approve(ArticleComment $comment, int $moderatorId, ?string $note = null): ArticleComment
    {
        return DB::transaction(function () use ($comment, $moderatorId, $note) {
            $comment->status = 'approved';
            $comment->moderated_by = $moderatorId;
            $comment->moderated_at = now();
            if ($note !== null) {
                $comment->moderation_note = $note;
            }
            $comment->save();
            Cache::tags(['articles', 'comments'])->flush();
            return $comment->fresh();
        });
    }

    /**
     * Отклонить комментарий.
     */
    public function reject(ArticleComment $comment, int $moderatorId, string $note): ArticleComment
    {
        return DB::transaction(function () use ($comment, $moderatorId, $note) {
            $comment->status = 'rejected';
            $comment->moderated_by = $moderatorId;
            $comment->moderated_at = now();
            $comment->moderation_note = $note;
            $comment->save();
            Cache::tags(['articles', 'comments'])->flush();
            return $comment->fresh();
        });
    }
}