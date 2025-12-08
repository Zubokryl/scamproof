<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controller imports
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
use App\Http\Controllers\Forum\ForumReplyController;
use App\Http\Controllers\Admin\ForumModerationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\GlossaryTermController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

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
|
| CRITICAL: DO NOT MODIFY THE LIKE ROUTE CONFIGURATION!
| The article like route MUST have the StartSession middleware to ensure proper
| session management for guest users. Removing this middleware will break the
| one-like-per-user functionality for guests.
|
| CRITICAL: COMMENT CREATION ROUTE MUST REMAIN IN AUTHENTICATED SECTION!
| Moving the comment creation route to public section will break user attribution
| and cause all comments to appear as anonymous, regardless of user authentication status.
| This was fixed in December 2025 - do not revert this change.
*/

// Public routes
Route::group([], function () {
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/{article}', [ArticleController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/categories/{slug}/articles', [CategoryController::class, 'articles']);
    Route::get('/categories/{slug}/landing', [CategoryController::class, 'showLanding']);
    Route::get('/categories/with-landings', [CategoryController::class, 'withLandings']);
    
    // Public comments routes
    Route::get('/articles/{article}/comments', [ArticleCommentController::class, 'index']);
    
    // Public search route
    Route::get('/search', [SearchController::class, 'search']);
    
    // Glossary routes
    Route::get('/glossary', [GlossaryTermController::class, 'index']);
    Route::get('/glossary/letters', [GlossaryTermController::class, 'letters']);
    
    // Public user profile route - for viewing other users' public profiles
    Route::get('/users/profile', [UserController::class, 'getProfile'])->middleware('auth:sanctum');
    Route::get('/users/{id}', [UserController::class, 'show']);
    
    // CRITICAL: DO NOT REMOVE THE StartSession MIDDLEWARE!
    // This middleware is ESSENTIAL for guest user session management.
    // Without it, each guest like request will create a new session,
    // breaking the one-like-per-user limitation for guests.
    Route::post('/articles/{article}/like', [ArticleLikeController::class, 'toggle'])->middleware(\Illuminate\Session\Middleware\StartSession::class);
    
    // Public comment like and reaction routes
    Route::post('/comments/{comment}/like', [ArticleCommentController::class, 'toggleLike']);
    Route::post('/comments/{comment}/react/{reactionType}', [ArticleCommentController::class, 'toggleReaction']);
    
    // Forum public routes
    Route::get('/forum/topics', [ForumTopicController::class, 'index']);
    Route::get('/forum/topics/latest', [ForumTopicController::class, 'latest']);
    Route::get('/forum/topics/category/{categorySlug}', [ForumTopicController::class, 'byCategory']);
    Route::get('/forum/topics/search', [ForumTopicController::class, 'search']);
    Route::get('/forum/topics/{topic}', [ForumTopicController::class, 'show']);

});

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    // Apply role middleware to specific routes
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('role:admin');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->middleware('role:admin');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->middleware('role:admin');

    // Group article routes with role middleware (auth:sanctum already applied to group)
    Route::post('/articles', [ArticleController::class, 'store'])->middleware('role:admin');
    Route::post('/articles/{article}', [ArticleController::class, 'update'])->middleware('role:admin');
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy'])->middleware('role:admin');
    
    // CRITICAL: COMMENT CREATION ROUTE MUST REMAIN HERE (AUTHENTICATED SECTION)!
    // Moving this route to the public section will break user attribution for comments.
    // All comments will appear as anonymous regardless of user authentication status.
    // This was fixed in December 2025 - do not move this route to public section.
    Route::post('/articles/{article}/comments', [ArticleCommentController::class, 'store']);
    Route::put('/comments/{comment}', [ArticleCommentController::class, 'update']);
    Route::delete('/comments/{comment}', [ArticleCommentController::class, 'destroy']);
    
    // Forum topic creation (regular users can create topics)
    Route::post('/forum/topics', [ForumTopicController::class, 'store']);
    Route::post('/forum/topics/{topic}/like', [ForumTopicController::class, 'toggleLike']);
    
    // Forum replies
    Route::post('/forum/topics/{topicSlug}/replies', [ForumReplyController::class, 'store']);
    Route::put('/forum/replies/{reply}', [ForumReplyController::class, 'update']);
    Route::delete('/forum/replies/{reply}', [ForumReplyController::class, 'destroy']);
    Route::post('/forum/replies/{reply}/like', [ForumReplyController::class, 'toggleLike']);

    // Admin manage badges
    Route::post('/admin/badges/{userId}', [UserBadgeController::class, 'assignBadge'])->middleware('role:admin');
    Route::delete('/admin/badges/{badgeId}', [UserBadgeController::class, 'removeBadge'])->middleware('role:admin');
    Route::get('/admin/badges/{userId}', [UserBadgeController::class, 'listBadges'])->middleware('role:admin');

    // User profile routes
    Route::get('/users/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::delete('/profile', [UserController::class, 'deleteProfile']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users/{id}/password', [UserController::class, 'changePassword']);
    Route::get('/users/{id}/activities', [UserController::class, 'activityLog']);
    Route::get('/users/{id}/logins', [UserController::class, 'loginHistory']);
    Route::get('/users/{id}/badges', [UserController::class, 'userBadges']);
    Route::get('/users/{id}/statistics', [UserController::class, 'getStatistics']);
    Route::get('/users/{id}/comments', [UserController::class, 'getUserComments']);
    
    // Private messaging
    Route::post('/messages', [PrivateMessageController::class, 'store']);
    Route::get('/messages', [PrivateMessageController::class, 'index']);
    Route::get('/messages/conversations', [PrivateMessageController::class, 'getConversations']);
    Route::get('/messages/conversation/{otherUserId}', [PrivateMessageController::class, 'getConversation']);
    Route::get('/messages/{message}', [PrivateMessageController::class, 'show']);
    Route::delete('/messages/{message}', [PrivateMessageController::class, 'destroy']);
    
    // Test route for debugging (without auth middleware)
    Route::get('/test-conversations-public', [PrivateMessageController::class, 'getConversations']);
    
    // User interactions (follow, etc.)
    Route::post('/users/{userId}/follow', [UserInteractionController::class, 'follow']);
    Route::delete('/users/{userId}/unfollow', [UserInteractionController::class, 'unfollow']);
    Route::get('/users/{userId}/followers', [UserInteractionController::class, 'followers']);
    Route::get('/users/{userId}/following', [UserInteractionController::class, 'following']);
    
    // Glossary admin routes
    Route::post('/glossary', [GlossaryTermController::class, 'store'])->middleware('role:admin');
    Route::put('/glossary/{glossaryTerm}', [GlossaryTermController::class, 'update'])->middleware('role:admin');
    Route::delete('/glossary/{glossaryTerm}', [GlossaryTermController::class, 'destroy'])->middleware('role:admin');
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

