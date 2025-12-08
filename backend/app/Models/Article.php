<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
    'title',
    'slug',
    'content',
    'category_id',
    'pdf_url',
    'created_by',
    'published_at',
    'thumbnail',
    'video_url',
];

    
    protected $casts = [
        'published_at' => 'datetime',
    ];

    // Route key name is now 'id' by default
    // public function getRouteKeyName()
    // {
    //     return 'slug';
    // }

    public function category()
    {
        return $this->belongsTo(\App\Models\Category::class, 'category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments()
    {
        return $this->hasMany(ArticleComment::class, 'article_id');
    }

    public function likes()
    {
        return $this->hasMany(ArticleLike::class, 'article_id');
    }

    public function relatedForumTopics()
{
    return $this->hasMany(ForumTopic::class, 'category_id', 'category_id')
                ->latest('last_activity_at')
                ->limit(5);
}


    // ===== Скоупы =====
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    public function scopeByCategory($query, $categorySlug)
    {
        return $query->whereHas('category', function ($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    // ===== Аксессоры =====
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getCommentsCountAttribute()
    {
        // Count all comments to match what users see
        return $this->comments()->count();
    }

    public function getForumDiscussionUrlAttribute()
{
    return $this->category && $this->category->forum_section_slug 
        ? route('forum.category', $this->category->forum_section_slug)
        : null;
}

public function getThumbnailUrlAttribute()
{
    return $this->thumbnail ? asset('storage/' . $this->thumbnail) : null;
}

public function getVideoUrlAttribute($value)
{
    return $value ? asset('storage/' . $value) : null;
}
}