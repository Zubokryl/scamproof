<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Laravel\Scout\Searchable;

class ForumTopic extends Model
{
    use HasFactory; // , Searchable;
    
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
        'likes_count',
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
        'likes_count' => 'integer',
        'last_activity_at' => 'datetime',
        'moderated_at' => 'datetime',
    ];

    // Define what fields should be indexed for search
    /*
    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => strip_tags($this->content),
            'category' => $this->category ? $this->category->name : '',
        ];
    }
    */

    // Specify the search index name
    /*
    public function searchableAs()
    {
        return 'topics';
    }
    */

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

    // likes relationship
    public function likes()
    {
        return $this->hasMany(ForumTopicLike::class, 'topic_id');
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

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // accessors
    public function getRouteKeyName()
    {
        return 'slug';
    }
}