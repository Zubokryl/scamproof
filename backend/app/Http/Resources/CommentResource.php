<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session;

class CommentResource extends JsonResource
{
    public function toArray($request)
    {
        // Preload relations if not already loaded to avoid N+1 queries
        if (!$this->relationLoaded('user')) {
            $this->load('user:id,name');
        }
        
        return [
            'id' => $this->id,
            'content' => $this->content,
            'status' => $this->status,
            'user' => $this->when(true, function () {
                // For authenticated users (when user_id is set and not null), return the user resource
                if ($this->user_id && $this->user_id !== null) {
                    // Make sure the user relationship is loaded
                    if ($this->user) {
                        return new \App\Http\Resources\UserResource($this->user);
                    }
                    // If user relationship is not loaded but user_id exists, create a minimal user object
                    return [
                        'id' => $this->user_id,
                        'name' => 'Пользователь #' . $this->user_id
                    ];
                }
                
                // For anonymous users, return a simplified user object
                return [
                    'id' => null,
                    'name' => 'Анонимный пользователь'
                ];
            }),
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
            'likes_count' => $this->likes_count,
            'user_has_liked' => $this->when($request->user(), function () use ($request) {
                // Use relation if already loaded, otherwise query directly
                if ($this->relationLoaded('likes')) {
                    return $this->likes->contains('user_id', $request->user()->id);
                }
                
                return \App\Models\CommentLike::where('comment_id', $this->id)
                    ->where('user_id', $request->user()->id)
                    ->exists();
            }),
            'reactions' => $this->when(true, function () use ($request) {
                // Use relation if already loaded, otherwise query directly with grouping
                if ($this->relationLoaded('reactions')) {
                    // Group reactions by type and count them
                    $groupedReactions = $this->reactions
                        ->groupBy('reaction_type')
                        ->map(function ($reactions) use ($request) {
                            $userHasReacted = false;
                            if ($request->user()) {
                                $userHasReacted = $reactions->contains('user_id', $request->user()->id);
                            } else {
                                $sessionId = Session::getId();
                                $userHasReacted = $reactions->contains('session_id', $sessionId);
                            }
                            
                            return [
                                'count' => $reactions->count(),
                                'user_has_reacted' => $userHasReacted
                            ];
                        });
                    
                    return $groupedReactions;
                }
                
                // More efficient database queries with grouping
                // First get the reaction counts grouped by type
                $reactionCounts = \App\Models\CommentReaction::selectRaw('reaction_type, COUNT(*) as count')
                    ->where('comment_id', $this->id)
                    ->groupBy('reaction_type')
                    ->pluck('count', 'reaction_type');
                
                // Then check if current user has reacted to each type
                $userReactions = [];
                if ($request->user()) {
                    $userReactions = \App\Models\CommentReaction::selectRaw('reaction_type, COUNT(*) as count')
                        ->where('comment_id', $this->id)
                        ->where('user_id', $request->user()->id)
                        ->groupBy('reaction_type')
                        ->pluck('count', 'reaction_type');
                } else {
                    $sessionId = Session::getId();
                    $userReactions = \App\Models\CommentReaction::selectRaw('reaction_type, COUNT(*) as count')
                        ->where('comment_id', $this->id)
                        ->whereNull('user_id')
                        ->where('session_id', $sessionId)
                        ->groupBy('reaction_type')
                        ->pluck('count', 'reaction_type');
                }
                
                // Combine the results
                $result = [];
                foreach ($reactionCounts as $reactionType => $count) {
                    $result[$reactionType] = [
                        'count' => (int)$count,
                        'user_has_reacted' => isset($userReactions[$reactionType])
                    ];
                }
                
                return $result;
            })
        ];
    }
}