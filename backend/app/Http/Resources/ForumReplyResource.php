<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class ForumReplyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Check if user is authenticated to determine if they liked this reply
        $userLiked = false;
        if (Auth::check()) {
            $userLiked = $this->likes()->where('user_id', Auth::id())->exists();
        }
        
        return [
            'id' => $this->id,
            'content' => $this->content,
            'topic_id' => $this->topic_id,
            'user' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                ];
            }),
            'parent_id' => $this->parent_id,
            'likes_count' => $this->likes_count ?? 0,
            'user_has_liked' => $userLiked,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'children' => $this->whenLoaded('children', ForumReplyResource::collection($this->children)),
        ];
    }
}