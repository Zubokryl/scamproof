<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Models\ArticleLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class ArticleLikeController extends Controller
{
    /**
     * Toggle like for an article
     * 
     * CRITICAL: DO NOT MODIFY THIS METHOD! This is the core of the like limitation functionality.
     * 
     * This method handles like toggling for both authenticated users and guests:
     * - Authenticated users: Can only like an article once (enforced by unique constraint on user_id + article_id)
     * - Guest users: Can only like an article once (enforced by unique constraint on session_id + article_id)
     * 
     * The method correctly handles:
     * 1. Removing existing likes (unliking)
     * 2. Preventing duplicate likes through database constraints
     * 3. Proper response codes for all scenarios
     * 
     * Both authenticated users and guests should only be able to like an article ONCE.
     * Any changes to this method MUST preserve this one-like-per-user functionality.
     * 
     * IMPORTANT: This route MUST have the StartSession middleware applied in routes/api.php
     * to ensure proper session management for guest users.
     */
    public function toggle(Request $request, $articleId) {
        Log::info('ArticleLikeController toggle called', [
            'article_id' => $articleId,
            'user_id' => $request->user() ? $request->user()->id : null,
            'session_id' => Session::getId(),
            'is_authenticated' => $request->user() ? true : false,
            'all_session_data' => Session::all()
        ]);
        
        // Check if user is authenticated
        if ($request->user()) {
            // Authenticated user - use user ID
            $userId = $request->user()->id;
            $like = ArticleLike::where('article_id', $articleId)
                ->where('user_id', $userId)
                ->first();
                
            Log::info('Authenticated user check', [
                'user_id' => $userId,
                'existing_like' => $like ? $like->toArray() : null
            ]);
        } else {
            // Guest user - use session ID
            $sessionId = Session::getId();
            $like = ArticleLike::where('article_id', $articleId)
                ->where('session_id', $sessionId)
                ->first();
                
            Log::info('Guest user check', [
                'session_id' => $sessionId,
                'existing_like' => $like ? $like->toArray() : null
            ]);
        }

        if ($like) {
            Log::info('Removing existing like');
            $like->delete();
            return response()->json(['liked' => false]);
        }

        try {
            if ($request->user()) {
                // Authenticated user
                Log::info('Creating like for authenticated user', [
                    'article_id' => $articleId,
                    'user_id' => $request->user()->id
                ]);
                
                ArticleLike::create([
                    'article_id' => $articleId,
                    'user_id' => $request->user()->id,
                ]);
            } else {
                // Guest user
                Log::info('Creating like for guest user', [
                    'article_id' => $articleId,
                    'session_id' => Session::getId()
                ]);
                
                ArticleLike::create([
                    'article_id' => $articleId,
                    'session_id' => Session::getId(),
                ]);
            }
        } catch (QueryException $e) {
            Log::error('QueryException in ArticleLikeController', [
                'exception' => $e->getMessage(),
                'code' => $e->getCode()
            ]);
            
            // Handle duplicate entry error
            if ($e->getCode() == 23000) {
                // Duplicate entry, this means the user has already liked this article
                // Return liked = false to indicate they should see it as unliked
                return response()->json(['liked' => false]);
            }
            throw $e; // Re-throw if it's a different error
        }

        return response()->json(['liked' => true]);
    }
}