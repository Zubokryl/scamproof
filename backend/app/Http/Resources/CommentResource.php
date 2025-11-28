<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'status' => $this->status,
            'user' => new \App\Http\Resources\UserResource($this->whenLoaded('user')),
            'article' => $this->whenLoaded('article', function () {
                return [
                    'id' => $this->article->id,
                    'title' => $this->article->title,
                    'slug' => $this->article->slug,
                ];
            }),
            'moderated_by' => $this->moderated_by,
            'moderation_note' => $this->moderation_note,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}