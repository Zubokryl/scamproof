<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class ForumTopicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Check if user is authenticated to determine if they liked this topic
        $userLiked = false;
        if (Auth::check()) {
            $userLiked = $this->likes()->where('user_id', Auth::id())->exists();
        }
        
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ];
            }),
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                ];
            }),
            'replies_count' => $this->replies_count ?? $this->replies()->count(),
            'likes_count' => $this->likes_count ?? 0,
            'user_has_liked' => $userLiked,
            'is_pinned' => (bool) ($this->is_pinned ?? false),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // если подгружены короткие наборы reply'ев — включаем их
            'recent_replies' => $this->whenLoaded('recentReplies', \App\Http\Resources\ForumReplyResource::collection($this->recentReplies ?? collect())),
        ];
    }
}