<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ForumTopicResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'section_slug' => $this->section_slug ?? null,
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                ];
            }),
            'replies_count' => $this->replies_count ?? $this->replies()->count(),
            'is_pinned' => (bool) ($this->is_pinned ?? false),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // если подгружены короткие наборы reply'ев — включаем их
            'recent_replies' => $this->whenLoaded('recentReplies', \App\Http\Resources\CommentResource::collection($this->recentReplies ?? collect())),
        ];
    }
}