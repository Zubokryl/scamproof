<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request)
    {
        // Use the articles_count attribute if it's already loaded, otherwise use the count
        $articlesCount = $this->articles_count ?? 0;
        
        // Use the forumTopics_count attribute if it's already loaded, otherwise use the count
        $forumTopicsCount = $this->forum_topics_count ?? 0;

        // Возвращаем трансформированные данные, минимально необходимое API
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'landing_enabled' => (bool) $this->landing_enabled,
            'articles_count' => $articlesCount,
            'seo' => [
                'title' => $this->meta_title ?? $this->seo_title ?? null,
                'description' => $this->meta_description ?? $this->seo_description ?? null,
                'keywords' => $this->meta_keywords ?? null,
            ],
        ];
    }
}