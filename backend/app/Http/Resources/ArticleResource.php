<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'slug'           => $this->slug,
            'content'        => $this->content,
            'pdf_url'        => $this->pdf_url,
            'published_at'   => $this->published_at,
            'category'       => $this->whenLoaded('category'),
            'author'         => $this->whenLoaded('author'),
            'likes_count'    => $this->likes_count ?? $this->likes()->count(),
            'comments_count' => $this->comments_count ?? $this->comments()->count(),
        ];
    }
}
