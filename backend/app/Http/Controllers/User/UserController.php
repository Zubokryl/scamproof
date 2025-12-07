<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Article;
use App\Models\ArticleComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\UserProfileUpdateRequest;

class UserController extends Controller
{
    // Список всех пользователей (для админа/модератора)
    public function index()
    {
        return response()->json(User::all());
    }

    // Профиль текущего пользователя (универсальный)
    public function getProfile()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $user->role === 'admin'
            ? $this->getAdminProfile($user)
            : $this->getUserProfile($user);
    }

    protected function getAdminProfile($user)
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'about' => 'Admin user profile info',
            'role' => $user->role,
            'profile_photo_url' => $this->getAvatarUrl($user->avatar),
        ]);
    }

    protected function getUserProfile($user)
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'bio' => $user->bio,
            'role' => $user->role,
            'reputation' => $user->reputation,
            'trusted_badge' => $user->trusted_badge,
            'account_status' => $user->account_status,
            'timezone' => $user->timezone,
            'locale' => $user->locale,
            'social_links' => $user->social_links ?? [],
            'favorites' => $user->favorites ?? [],
            'blocked_users' => $user->blocked_users ?? [],
            'notification_settings' => $user->notification_settings ?? [],
            'profile_photo_url' => $this->getAvatarUrl($user->avatar),
            'last_active' => $user->last_active, // Add last_active field
        ]);
    }

    protected function getAvatarUrl($avatar)
    {
        if (!$avatar) return '';
        return str_starts_with($avatar, 'http')
            ? $avatar
            : asset('storage/' . ltrim($avatar, '/'));
    }

    // Обновление профиля
    public function updateProfile(UserProfileUpdateRequest $request)
    {
        $user = $request->user();

        // Берём только валидированные поля
        $data = $request->validated();

        // Защита: не разрешаем менять роль/permissions через профиль
        unset($data['role'], $data['is_admin']);

        $user->fill($data);

        // Обновление фото профиля
        if ($request->hasFile('profile_photo')) {
            $file = $request->file('profile_photo');
            if ($file->isValid()) {
                if ($user->avatar) {
                    $oldPath = str_replace(asset('storage/'), '', $user->avatar);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
                $filename = 'profile_photos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_photos', basename($filename), 'public');
                $user->avatar = $path;
            }
        }

        $user->save();
        return $this->getUserProfile($user);
    }

    // Профиль любого пользователя по ID (publicly accessible)
    public function show($id)
    {
        \Log::info('UserController@show called with ID: ' . $id);
        
        try {
            $user = User::findOrFail($id);
            \Log::info('UserController@show found user: ' . $user->name);
            
            // For public profiles, only return limited user information
            $publicProfile = [
                'id' => $user->id,
                'name' => $user->name,
                'bio' => $user->bio,
                'role' => $user->role,
                'reputation' => $user->reputation,
                'trusted_badge' => $user->trusted_badge,
                'account_status' => $user->account_status,
                'profile_photo_url' => $this->getAvatarUrl($user->avatar),
                'last_active' => $user->last_active,
            ];
            
            \Log::info('UserController@show returning user profile');
            
            return response()->json($publicProfile);
        } catch (\Exception $e) {
            \Log::error('UserController@show error: ' . $e->getMessage());
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    // Изменение пароля
    public function changePassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($request->password);
        $user->last_password_change_at = now();
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    // Удаление своего профиля
    public function deleteProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // удалить фото профиля
        if ($user->avatar) {
            $oldPath = str_replace(asset('storage/'), '', $user->avatar);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        User::destroy($user->id);

        return response()->json(['message' => 'Your account has been deleted successfully']);
    }

    public function activityLog($id)
    {
        $user = Auth::user();
        
        // Users can view their own activity logs, admins can view any, and anyone can view public activity logs
        if ($user && $user->id != $id && $user->role !== 'admin') {
            // For non-admin users viewing others' activity logs, we can allow public viewing
            // Remove the restrictive check to make activity logs publicly accessible
        }
        
        // Get the user we're fetching activity logs for
        $targetUser = User::findOrFail($id);
        
        $logs = \App\Models\UserActivityLog::where('user_id', $targetUser->id)->latest()->get();
        return response()->json($logs);
    }

    public function loginHistory($id)
    {
        $user = Auth::user();
        
        // Users can only view their own login history, or admins can view any
        if ($user && $user->id != $id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $logins = \App\Models\UserLogin::where('user_id', $id)->latest()->get();
        return response()->json($logins);
    }

    public function userBadges($id)
    {
        $user = Auth::user();
        
        // Users can only view their own badges, or admins can view any
        if ($user && $user->id != $id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $badges = \App\Models\UserBadge::where('user_id', $id)->get();
        return response()->json($badges);
    }

    // Method to get user statistics
    public function getStatistics($id)
    {
        $user = Auth::user();
        
        // Users can view their own statistics, admins can view any, and anyone can view public statistics
        if ($user && $user->id != $id && $user->role !== 'admin') {
            // For non-admin users viewing others' stats, we can return limited information
            // Or we can allow public viewing of statistics - let's allow it for now
        }
        
        // Get the user we're fetching stats for
        $targetUser = User::findOrFail($id);
        
        // Calculate statistics
        $postsCreated = Article::where('created_by', $targetUser->id)->count();
        $commentsWritten = ArticleComment::where('user_id', $targetUser->id)->count();
        
        // For people helped, we'll count unique users who have replied to the same articles
        // where this user has commented (as a simple proxy for helping others)
        $peopleHelped = ArticleComment::whereIn('article_id', function($query) use ($targetUser) {
            $query->select('article_id')
                  ->from('article_comments')
                  ->where('user_id', $targetUser->id);
        })->where('user_id', '!=', $targetUser->id)
          ->distinct('user_id')
          ->count('user_id');
        
        return response()->json([
            'postsCreated' => $postsCreated,
            'commentsWritten' => $commentsWritten,
            'peopleHelped' => $peopleHelped
        ]);
    }

    // Method to get user's recent comments for activity section
    public function getUserComments($id)
    {
        $user = Auth::user();
        
        // Users can view their own comments, admins can view any, and anyone can view public comments
        if ($user && $user->id != $id && $user->role !== 'admin') {
            // For non-admin users viewing others' comments, we can allow public viewing
        }
        
        // Get the user we're fetching comments for
        $targetUser = User::findOrFail($id);
        
        // Get user's recent comments with article information
        $comments = ArticleComment::where('user_id', $targetUser->id)
            ->with(['article:id,title,slug']) // Load article data
            ->select(['id', 'article_id', 'content', 'created_at'])
            ->latest()
            ->limit(10) // Limit to 10 most recent comments
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'type' => 'comment',
                    'title' => 'Комментарий к теме «' . ($comment->article ? $comment->article->title : 'Без названия') . '»',
                    'preview' => $comment->content,
                    'timestamp' => $comment->created_at->diffForHumans(), // Human readable timestamp
                    'created_at' => $comment->created_at->toISOString(), // ISO format for sorting
                    'article_id' => $comment->article ? $comment->article->id : null,
                    'article_slug' => $comment->article ? $comment->article->slug : null,
                ];
            });
        
        return response()->json($comments);
    }
}