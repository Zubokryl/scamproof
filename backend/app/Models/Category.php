<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Category extends Model
{
    use Searchable;

    protected $fillable = [
        // Основные поля
        'slug', 'name', 'description', 'icon',
        
        // Поля для лендингов
        'landing_enabled', 'landing_title', 'landing_content', 'landing_template',
        
        // SEO метатеги
        'meta_title', 'meta_description', 'meta_keywords',
        
        // Связь с форумом
        'forum_section_slug'
    ];

    protected $casts = [
        'landing_enabled' => 'boolean',
    ];

    // Define what fields should be indexed for search
    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
        ];
    }

    // ===== СВЯЗИ =====
    
    public function articles()
    {
        return $this->hasMany(\App\Models\Article::class, 'category_id');
    }

    // Связь с темами форума
    public function forumTopics()
    {
        return $this->hasMany(\App\Models\ForumTopic::class, 'category_id');
    }

    // ===== СКОУПЫ =====
    
    // Категории с включенными лендингами
    public function scopeWithLanding($query)
    {
        return $query->where('landing_enabled', true);
    }

    // Категории для главной страницы
    public function scopeForHomepage($query)
    {
        return $query->whereNotNull('icon')
                     ->orderBy('name');
    }

    // ===== АКСЕССОРЫ =====
    
    // Количество статей в категории (cached)
    public function getArticlesCountAttribute()
    {
        // This will be set by withCount in the query
        return $this->attributes['articles_count'] ?? 0;
    }

    // Количество тем форума в категории (cached)
    public function getForumTopicsCountAttribute()
    {
        // This will be set by withCount in the query
        return $this->attributes['forum_topics_count'] ?? 0;
    }

    // URL лендинга (если включен)
    public function getLandingUrlAttribute()
    {
        return $this->landing_enabled 
            ? route('category.landing', $this->slug) 
            : route('category.show', $this->slug);
    }

    // SEO заголовок (или обычное название если не задан)
    public function getSeoTitleAttribute()
    {
        return $this->meta_title ?: $this->name;
    }

    // SEO описание (или обрезанное описание если не задано)
    public function getSeoDescriptionAttribute()
    {
        return $this->meta_description ?: Str::limit($this->description, 160);
    }
}