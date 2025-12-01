<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleComment extends Model
{
    protected $fillable = [
        'article_id', 'user_id', 'content', 
        'status', 'moderated_by', 'moderated_at', 'moderation_note'
    ];

    protected $casts = [
        'moderated_at' => 'datetime',
    ];

    // ===== СВЯЗИ =====
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }

    // Связь с модератором
    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    // ===== СКОУПЫ =====
    
    // Только одобренные комментарии
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    // Ожидающие модерации
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Отклоненные
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // ===== МЕТОДЫ =====
    
    // Одобрить комментарий
    public function approve($moderatorId, $note = null)
    {
        $this->update([
            'status' => 'approved',
            'moderated_by' => $moderatorId,
            'moderated_at' => now(),
            'moderation_note' => $note
        ]);
    }

    // Отклонить комментарий
    public function reject($moderatorId, $note = null)
    {
        $this->update([
            'status' => 'rejected',
            'moderated_by' => $moderatorId,
            'moderated_at' => now(),
            'moderation_note' => $note
        ]);
    }

    // Проверка статуса
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}
