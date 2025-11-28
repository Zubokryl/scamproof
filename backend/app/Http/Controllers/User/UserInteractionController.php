<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserFollow;
use App\Models\MutedUser;
use Illuminate\Http\Request;

class UserInteractionController extends Controller
{
    // === FOLLOW ===
    public function follow(Request $request, $followedId)
    {
        $follow = UserFollow::firstOrCreate([
            'follower_id' => $request->user()->id,
            'followed_id' => $followedId,
        ]);

        return response()->json($follow);
    }

    public function unfollow(Request $request, $followedId)
    {
        UserFollow::where('follower_id', $request->user()->id)
            ->where('followed_id', $followedId)
            ->delete();

        return response()->json(['message' => 'Unfollowed successfully']);
    }

    public function listFollowers($userId)
    {
        $followers = UserFollow::where('followed_id', $userId)->with('follower')->get();
        return response()->json($followers);
    }

    public function listFollowing($userId)
    {
        $following = UserFollow::where('follower_id', $userId)->with('followed')->get();
        return response()->json($following);
    }

    // === MUTE ===
    public function mute(Request $request, $mutedId)
    {
        $mute = MutedUser::firstOrCreate([
            'user_id' => $request->user()->id,
            'muted_user_id' => $mutedId,
        ]);

        return response()->json($mute);
    }

    public function unmute(Request $request, $mutedId)
    {
        MutedUser::where('user_id', $request->user()->id)
            ->where('muted_user_id', $mutedId)
            ->delete();

        return response()->json(['message' => 'Unmuted successfully']);
    }

    public function listMuted(Request $request)
    {
        $muted = MutedUser::where('user_id', $request->user()->id)->with('mutedUser')->get();
        return response()->json($muted);
    }
}
