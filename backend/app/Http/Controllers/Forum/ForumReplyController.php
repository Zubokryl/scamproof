<?php

namespace App\Http\Controllers\Forum;

use App\Http\Controllers\Controller;
use App\Http\Resources\ForumReplyResource;
use App\Models\ForumReply;
use App\Models\ForumTopic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ForumReplyController extends Controller
{
    /**
     * Store a newly created reply in storage.
     */
    public function store(Request $request, $topicSlug)
    {
        // Manually resolve the topic by slug
        $topic = ForumTopic::where('slug', $topicSlug)->firstOrFail();
        
        $request->validate([
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:forum_replies,id',
        ]);

        $reply = new ForumReply();
        $reply->topic_id = $topic->id;
        $reply->user_id = Auth::id();
        $reply->content = $request->content;
        $reply->parent_id = $request->parent_id;
        $reply->status = 'approved'; // Auto-approve for now
        $reply->save();

        // Update topic's last activity and replies count
        $topic->increment('replies_count');
        $topic->update(['last_activity_at' => now()]);

        // Load relationships for response
        $reply->load('author:id,name');

        return response()->json([
            'message' => 'Reply created successfully',
            'reply' => new ForumReplyResource($reply)
        ], 201);
    }

    /**
     * Update the specified reply in storage.
     */
    public function update(Request $request, ForumReply $reply)
    {
        // Check if the authenticated user is authorized to update the reply
        $this->authorize('update', $reply);

        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $reply->content = $request->content;
        $reply->save();

        // Load relationships for response
        $reply->load('author:id,name');

        return response()->json([
            'message' => 'Reply updated successfully',
            'reply' => new ForumReplyResource($reply->fresh())
        ]);
    }

    /**
     * Remove the specified reply from storage.
     */
    public function destroy(ForumReply $reply)
    {
        // Check if the authenticated user is authorized to delete the reply
        $this->authorize('delete', $reply);

        // Decrement topic's replies count
        $reply->topic->decrement('replies_count');
        
        $reply->delete();

        return response()->json(['message' => 'Reply deleted successfully']);
    }

    /**
     * Toggle like for a reply
     */
    public function toggleLike(ForumReply $reply)
    {
        $user = Auth::user();
        
        // Check if user has already liked this reply
        $existingLike = $reply->likes()->where('user_id', $user->id)->first();
        
        if ($existingLike) {
            // Unlike
            $existingLike->delete();
            $reply->decrement('likes_count');
            $liked = false;
        } else {
            // Like
            $reply->likes()->create(['user_id' => $user->id]);
            $reply->increment('likes_count');
            $liked = true;
        }
        
        return response()->json([
            'liked' => $liked,
            'likes_count' => $reply->likes_count
        ]);
    }
}