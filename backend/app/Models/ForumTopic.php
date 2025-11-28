<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ForumTopic extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'category_id',
        'title',
        'content',
        'slug',
        'created_by',
        'is_pinned',
        'is_locked',
        'views_count',
        'replies_count',
        'last_activity_at',
        'status',
        'moderated_by',
        'moderated_at',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'views_count' => 'integer',
        'replies_count' => 'integer',
        'last_activity_at' => 'datetime',
        'moderated_at' => 'datetime',
    ];

    // relationships
    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function replies()
    {
        return $this->hasMany(ForumReply::class, 'topic_id');
    }

    public function moderatedBy()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    // scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    // accessors
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
