<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleComment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;

class CommentService
{
    /**
     * Создать комментарий (ставится approved сразу) и инвалидация кеша.
     */
    public function create(Article $article, $userId, array $data): ArticleComment
    {
        return DB::transaction(function () use ($article, $userId, $data) {
            $commentData = [
                'article_id' => $article->id,
                'content' => $data['content'],
                'status' => 'approved', // Change from 'pending' to 'approved'
            ];
            
            // Add user_id if user is authenticated, otherwise use session_id for guests
            if ($userId) {
                $commentData['user_id'] = $userId;
            } else {
                $commentData['session_id'] = Session::getId();
            }
            
            $comment = ArticleComment::create($commentData);
            
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
        
        DB::transaction(function () use ($comment, $articleId) {
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