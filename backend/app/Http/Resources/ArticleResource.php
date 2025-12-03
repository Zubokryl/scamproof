<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ArticleResource extends JsonResource
{
    // Disable wrapping to avoid double-wrapping issue
    public static $wrap = null;
    
    /**
     * Transform the resource into an array.
     *
     * CRITICAL: DO NOT MODIFY THE user_has_liked AND guest_has_liked LOGIC!
     * 
     * This method is responsible for determining whether a user or guest has already liked an article.
     * Changing this logic will break the one-like-per-user functionality.
     * 
     * For authenticated users:
     * - Checks if the user has already liked the article using their user_id
     * 
     * For guest users:
     * - Checks if the session has already liked the article using session_id
     * 
     * Both authenticated users and guests should only be able to like an article ONCE.
     * Any changes to this method MUST preserve this one-like-per-user functionality.
     * 
     * IMPORTANT: The session_id used here MUST match the session_id used in ArticleLikeController
     * to ensure consistency between guest like state detection and like creation.
     */
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

        // Use the likes_count and comments_count attributes if they're already loaded
        $likesCount = $this->likes_count ?? 0;
        $commentsCount = $this->comments_count ?? 0;

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
            'likes_count' => $likesCount,
            'comments_count' => $commentsCount,
        ];
        
        // Add user_has_liked for authenticated users
        // CRITICAL: This prevents authenticated users from liking an article multiple times
        if ($request->user()) {
            $result['user_has_liked'] = $this->likes()->where('user_id', $request->user()->id)->exists();
        } else {
            // Add guest_has_liked for guest users
            // CRITICAL: This prevents guest users from liking an article multiple times
            // IMPORTANT: This MUST use the same session mechanism as ArticleLikeController
            $sessionId = Session::getId();
            $result['guest_has_liked'] = $this->likes()->where('session_id', $sessionId)->exists();
        }
        
        Log::info('ArticleResource result', ['result' => $result]);

        return $result;
    }
}