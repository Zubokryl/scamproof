<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserBadge;
use Illuminate\Http\Request;

class UserBadgeController extends Controller
{
    // Выдать бейдж пользователю
    public function assignBadge(Request $request, $userId)
    {
        $request->validate([
            'badge_type' => 'required|string',
            'title' => 'required|string',
            'icon' => 'nullable|string',
        ]);

        $badge = UserBadge::create([
            'user_id' => $userId,
            'badge_type' => $request->badge_type,
            'title' => $request->title,
            'icon' => $request->icon,
            'awarded_at' => now(),
        ]);

        return response()->json($badge);
    }

    // Удалить бейдж
    public function removeBadge($badgeId)
    {
        $badge = UserBadge::findOrFail($badgeId);
        $badge->delete();

        return response()->json(['message' => 'Badge removed successfully']);
    }

    // Список бейджей пользователя
    public function listBadges($userId)
    {
        $badges = UserBadge::where('user_id', $userId)->get();
        return response()->json($badges);
    }
}
