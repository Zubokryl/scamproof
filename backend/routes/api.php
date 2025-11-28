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
|  - Authenticated: auth:sanctum (session / token protected)
|  - Admin / Moderation: auth:sanctum + role middleware
|
*/

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.forgot');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
// Email verification (signed link) — match controller signature (id/hash optional)
Route::post('/email/verify/{id}/{hash?}', [AuthController::class, 'emailVerify'])->name('verification.verify');

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/articles', [CategoryController::class, 'articles']);
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article:slug}', [ArticleController::class, 'show']);

Route::get('/forum/topics', [ForumTopicController::class, 'index']);
Route::get('/forum/topics/{slug}', [ForumTopicController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth (session/token)
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // User profile
    Route::get('/users/profile', [UserController::class, 'getProfile']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::delete('/users/profile', [UserController::class, 'deleteProfile']);
    Route::put('/users/{id}/password', [UserController::class, 'changePassword']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/users/{id}/badges', [UserController::class, 'userBadges']);
    Route::get('/users/{id}/activities', [UserController::class, 'activityLog']);

    // Messages
    Route::get('/messages', [PrivateMessageController::class, 'index']);
    Route::post('/messages', [PrivateMessageController::class, 'store']);
    Route::put('/messages/{id}/read', [PrivateMessageController::class, 'markAsRead']);

    // User interactions
    Route::prefix('interactions')->group(function () {
        Route::post('/follow/{id}', [UserInteractionController::class, 'follow']);
        Route::delete('/unfollow/{id}', [UserInteractionController::class, 'unfollow']);
        Route::get('/followers/{id}', [UserInteractionController::class, 'listFollowers']);
        Route::get('/following/{id}', [UserInteractionController::class, 'listFollowing']);

        Route::post('/mute/{id}', [UserInteractionController::class, 'mute']);
        Route::delete('/unmute/{id}', [UserInteractionController::class, 'unmute']);
        Route::get('/muted', [UserInteractionController::class, 'listMuted']);
    });

    // Forum: create topic (authenticated users)
    Route::post('/forum/topics', [ForumTopicController::class, 'store']);

    // Article comments that require auth
    Route::post('/articles/{article:slug}/comments', [ArticleCommentController::class, 'store']);
    Route::delete('/articles/{article:slug}/comments/{comment}', [ArticleCommentController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Admin / Moderation (auth + role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin CRUD for categories/articles
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{article:slug}', [ArticleController::class, 'update']);
    Route::delete('/articles/{article:slug}', [ArticleController::class, 'destroy']);

    // Admin manage badges
    Route::post('/admin/badges/{userId}', [UserBadgeController::class, 'assignBadge']);
    Route::delete('/admin/badges/{badgeId}', [UserBadgeController::class, 'removeBadge']);
    Route::get('/admin/badges/{userId}', [UserBadgeController::class, 'listBadges']);

    // Article like (admin route kept as in current code)
    Route::post('/articles/{article:slug}/like', [ArticleLikeController::class, 'toggle']);
});

// Admin + moderator moderation endpoints
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin,moderator'])->group(function () {
    // Article comments moderation
    Route::get('/comments/pending', [ArticleCommentController::class, 'pending']);
    Route::post('/comments/{comment}/approve', [ArticleCommentController::class, 'approve']);
    Route::post('/comments/{comment}/reject', [ArticleCommentController::class, 'reject']);
    Route::get('/comments/moderation/stats', [ArticleCommentController::class, 'moderationStats']);

    // Forum topics moderation
    Route::post('/forum/topics/{topic}/status', [ForumModerationController::class, 'setStatus']);
    Route::post('/forum/topics/{topic}/pinned', [ForumModerationController::class, 'setPinned']);
    Route::delete('/forum/topics/{topic}', [ForumModerationController::class, 'delete']);
});



