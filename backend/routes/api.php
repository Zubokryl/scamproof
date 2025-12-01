<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\PrivateMessageController;
use App\Http\Controllers\User\UserInteractionController;
use App\Http\Controllers\Admin\UserBadgeController;
use App\Http\Controllers\Article\CategoryController;
use App\Http\Controllers\Article\ArticleController;
use App\Http\Controllers\Article\ArticleCommentController;
use App\Http\Controllers\Article\ArticleLikeController;
use App\Http\Controllers\Forum\ForumTopicController;
use App\Http\Controllers\Admin\ForumModerationController;

/*
|--------------------------------------------------------------------------
| API Routes (organized)
|--------------------------------------------------------------------------
|
| Sections:
|  - Public: open endpoints (articles, categories, forum read, auth endpoints)
|  - Authenticated: authenticated user endpoints
|  - Admin: admin-only endpoints
|  - Moderation: moderator/admin endpoints
*/

// Public routes
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/articles', [CategoryController::class, 'articles']);
Route::get('/categories/{slug}/landing', [CategoryController::class, 'showLanding']);
Route::get('/categories/with-landings', [CategoryController::class, 'withLandings']);

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Forum public routes
Route::get('/forum/topics', [ForumTopicController::class, 'index']);
Route::get('/forum/topics/{topic}', [ForumTopicController::class, 'show']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Apply role middleware to specific routes
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('role:admin');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->middleware('role:admin');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->middleware('role:admin');

    // Group article routes with both auth and role middleware
    Route::post('/articles', [ArticleController::class, 'store'])->middleware('auth:sanctum')->middleware('role:admin');
    Route::put('/articles/{article}', [ArticleController::class, 'update'])->middleware('auth:sanctum')->middleware('role:admin');
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy'])->middleware('auth:sanctum')->middleware('role:admin');
    Route::post('/articles/{article}/like', [ArticleLikeController::class, 'toggle'])->middleware('auth:sanctum')->middleware('role:admin');

    // Admin manage badges
    Route::post('/admin/badges/{userId}', [UserBadgeController::class, 'assignBadge'])->middleware('role:admin');
    Route::delete('/admin/badges/{badgeId}', [UserBadgeController::class, 'removeBadge'])->middleware('role:admin');
    Route::get('/admin/badges/{userId}', [UserBadgeController::class, 'listBadges'])->middleware('role:admin');

    // User profile routes
    Route::get('/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::post('/profile/avatar', [UserController::class, 'updateProfile']);
    
    // Add the missing route that the frontend is trying to access
    Route::get('/users/profile', [UserController::class, 'getProfile']);
    
    // User activities route
    Route::get('/users/{userId}/activities', [UserController::class, 'activityLog']);
    
    // Private messaging
    Route::post('/messages', [PrivateMessageController::class, 'send']);
    Route::get('/messages', [PrivateMessageController::class, 'index']);
    Route::get('/messages/{message}', [PrivateMessageController::class, 'show']);
    Route::delete('/messages/{message}', [PrivateMessageController::class, 'destroy']);
    
    // User interactions (follow, etc.)
    Route::post('/users/{userId}/follow', [UserInteractionController::class, 'follow']);
    Route::delete('/users/{userId}/unfollow', [UserInteractionController::class, 'unfollow']);
    Route::get('/users/{userId}/followers', [UserInteractionController::class, 'followers']);
    Route::get('/users/{userId}/following', [UserInteractionController::class, 'following']);
    
    // Article comments
    Route::post('/articles/{article}/comments', [ArticleCommentController::class, 'store']);
    Route::put('/comments/{comment}', [ArticleCommentController::class, 'update']);
    Route::delete('/comments/{comment}', [ArticleCommentController::class, 'destroy']);
    Route::post('/comments/{comment}/like', [ArticleCommentController::class, 'toggleLike']);
});

// Admin + moderator moderation endpoints
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // Apply role middleware to specific routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/comments/pending', [ArticleCommentController::class, 'pending']);
        Route::post('/comments/{comment}/approve', [ArticleCommentController::class, 'approve']);
        Route::post('/comments/{comment}/reject', [ArticleCommentController::class, 'reject']);
        Route::get('/comments/moderation/stats', [ArticleCommentController::class, 'moderationStats']);

        // Forum topics moderation
        Route::post('/forum/topics/{topic}/status', [ForumModerationController::class, 'setStatus']);
        Route::post('/forum/topics/{topic}/pinned', [ForumModerationController::class, 'setPinned']);
        Route::delete('/forum/topics/{topic}', [ForumModerationController::class, 'delete']);
    });
});