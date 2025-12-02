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
            'user' => new \App\Http\Resources\UserResource($this->user),
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
            'likes_count' => $this->likes()->count(),
            'user_has_liked' => $this->when($request->user(), function () use ($request) {
                return \App\Models\CommentLike::where('comment_id', $this->id)
                    ->where('user_id', $request->user()->id)
                    ->exists();
            }),
        ];
    }
}