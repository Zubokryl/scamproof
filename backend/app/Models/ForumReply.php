<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumReply extends Model
{
    protected $fillable = [
        'topic_id',
        'user_id',
        'parent_id',
        'content',
        'status',
        'moderated_by',
        'moderated_at',
        'likes_count',
    ];

    protected $casts = [
        'moderated_at' => 'datetime',
        'likes_count' => 'integer',
    ];

    // scope для публичных (одобренных) ответов
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // связи
    public function author(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(ForumTopic::class, 'topic_id');
    }

    // для древовидных ответов
    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    // likes relationship
    public function likes()
    {
        return $this->hasMany(ForumReplyLike::class, 'reply_id');
    }
}