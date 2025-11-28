<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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

    // Профиль любого пользователя по ID
    public function show($id)
    {
        $user = User::findOrFail($id);
        return $this->getUserProfile($user);
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

        $user->delete();

        return response()->json(['message' => 'Your account has been deleted successfully']);
    }

    public function activityLog($id)
{
    $logs = \App\Models\UserActivityLog::where('user_id', $id)->latest()->get();
    return response()->json($logs);
}

public function loginHistory($id)
{
    $logins = \App\Models\UserLogin::where('user_id', $id)->latest()->get();
    return response()->json($logins);
}

public function userBadges($id)
{
    $badges = \App\Models\UserBadge::where('user_id', $id)->get();
    return response()->json($badges);
}

}
