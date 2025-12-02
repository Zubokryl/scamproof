<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class ArticleResource extends JsonResource
{
    // Disable wrapping to avoid double-wrapping issue
    public static $wrap = null;
    
    public function toArray($request)
    {
        Log::info('ArticleResource toArray called', [
            'article_id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'category_id' => $this->category_id,
            'has_category' => $this->relationLoaded('category'),
            'has_author' => $this->relationLoaded('author'),
            'category_data' => $this->relationLoaded('category') ? $this->category : null,
            'author_data' => $this->relationLoaded('author') ? $this->author : null
        ]);

        $result = [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'pdf_url' => $this->pdf_url,
            'published_at' => $this->published_at,
            'thumbnail' => $this->thumbnail,
            'thumbnail_url' => $this->thumbnail_url,
            'video_url' => $this->video_url,
            'category' => $this->whenLoaded('category'),
            'author' => $this->whenLoaded('author'),
            'likes_count' => $this->likes_count ?? $this->likes()->count(),
            'comments_count' => $this->comments_count ?? $this->comments()->count(),
        ];
        
        Log::info('ArticleResource result', ['result' => $result]);

        return $result;
    }
}