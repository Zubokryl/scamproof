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
            
            // Use cache forget instead of tags for drivers that don't support tagging
            Cache::forget('article_comments_' . $article->id);
            Cache::forget('articles_with_comments_count');
            
            return $comment;
        });
    }

    /**
     * Удаление комментария с инвалидацией кэша.
     */
    public function delete(ArticleComment $comment): void
    {
        $articleId = $comment->article_id;
        
        DB::transaction(function () use ($comment) {
            $comment->delete();
            
            // Use cache forget instead of tags for drivers that don't support tagging
            Cache::forget('article_comments_' . $articleId);
            Cache::forget('articles_with_comments_count');
        });
    }

    /**
     * Одобрить комментарий — устанавливает поля и инвалидацию.
     */
    public function approve(ArticleComment $comment, int $moderatorId, ?string $note = null): ArticleComment
    {
        $articleId = $comment->article_id;
        
        return DB::transaction(function () use ($comment, $moderatorId, $note, $articleId) {
            $comment->status = 'approved';
            $comment->moderated_by = $moderatorId;
            $comment->moderated_at = now();
            if ($note !== null) {
                $comment->moderation_note = $note;
            }
            $comment->save();
            
            // Use cache forget instead of tags for drivers that don't support tagging
            Cache::forget('article_comments_' . $articleId);
            Cache::forget('articles_with_comments_count');
            
            return $comment->fresh();
        });
    }

    /**
     * Отклонить комментарий.
     */
    public function reject(ArticleComment $comment, int $moderatorId, string $note): ArticleComment
    {
        $articleId = $comment->article_id;
        
        return DB::transaction(function () use ($comment, $moderatorId, $note, $articleId) {
            $comment->status = 'rejected';
            $comment->moderated_by = $moderatorId;
            $comment->moderated_at = now();
            $comment->moderation_note = $note;
            $comment->save();
            
            // Use cache forget instead of tags for drivers that don't support tagging
            Cache::forget('article_comments_' . $articleId);
            Cache::forget('articles_with_comments_count');
            
            return $comment->fresh();
        });
    }
}