<?php

namespace App\Http\Controllers\User;

use App\Models\UserFollow;
use Illuminate\Http\Request;

class UserFollowController extends Controller
{
    // Подписаться на пользователя
    public function follow(Request $request, $followedId)
    {
        $follow = UserFollow::firstOrCreate([
            'follower_id' => $request->user()->id,
            'followed_id' => $followedId,
        ]);

        return response()->json($follow);
    }

    // Отписаться
    public function unfollow(Request $request, $followedId)
    {
        UserFollow::where('follower_id', $request->user()->id)
            ->where('followed_id', $followedId)
            ->delete();

        return response()->json(['message' => 'Unfollowed successfully']);
    }
}
