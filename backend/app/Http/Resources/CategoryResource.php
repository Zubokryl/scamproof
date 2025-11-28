<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request)
    {
        // Возвращаем трансформированные данные, минимально необходимое API
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'landing_enabled' => (bool) $this->landing_enabled,
            'articles_count' => $this->articles_count ?? $this->articles()->published()->count(),
            'seo' => [
                'title' => $this->meta_title ?? $this->seo_title ?? null,
                'description' => $this->meta_description ?? $this->seo_description ?? null,
                'keywords' => $this->meta_keywords ?? null,
            ],
        ];
    }
}