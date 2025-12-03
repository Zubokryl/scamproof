<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Session;

class ArticleComment extends Model
{
    protected $fillable = [
        'article_id', 'user_id', 'session_id', 'content', 
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

    public function likes()
    {
        return $this->hasMany(CommentLike::class, 'comment_id');
    }
    
    public function reactions()
    {
        return $this->hasMany(CommentReaction::class, 'comment_id');
    }

    // ===== АКСЕССОРЫ =====
    
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
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
}