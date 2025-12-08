<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PrivateMessage;
use App\Models\User;

// Test user ID 3 (Николай)
$userId = 3;

echo "Testing queries for user ID: $userId\n";

// Get all unique users that the current user has messaged or received messages from
echo "Querying for conversation partners...\n";
$userIds = PrivateMessage::where('sender_id', $userId)
    ->pluck('receiver_id')
    ->merge(
        PrivateMessage::where('receiver_id', $userId)
            ->pluck('sender_id')
    )
    ->unique()
    ->values();

echo "Found conversation partners: " . json_encode($userIds->toArray()) . "\n";

// Get the latest message for each conversation
$conversations = [];
foreach ($userIds as $otherUserId) {
    echo "Processing user: $otherUserId\n";
    
    // Get the other user details
    $otherUser = User::find($otherUserId);
    if (!$otherUser) {
        echo "User not found: $otherUserId\n";
        continue;
    }

    echo "Found user: {$otherUser->name}\n";

    // Get the latest message between these two users
    echo "Querying for latest message between $userId and $otherUserId\n";
    $latestMessage = PrivateMessage::where(function($query) use ($userId, $otherUserId) {
        $query->where('sender_id', $userId)
              ->where('receiver_id', $otherUserId);
    })->orWhere(function($query) use ($userId, $otherUserId) {
        $query->where('sender_id', $otherUserId)
              ->where('receiver_id', $userId);
    })->orderBy('created_at', 'desc')
      ->first();
    
    echo "Latest message found: " . ($latestMessage ? 'yes' : 'no') . "\n";
    if ($latestMessage) {
        echo "Latest message content: {$latestMessage->content}\n";
    }

    // Count unread messages from this user
    echo "Counting unread messages from user $otherUserId\n";
    $unreadCount = PrivateMessage::where('receiver_id', $userId)
        ->where('sender_id', $otherUserId)
        ->where('is_read', false)
        ->count();
    echo "Unread count: $unreadCount\n";

    $conversations[] = [
        'user_id' => $otherUserId,
        'user_name' => $otherUser->name,
        'user_avatar' => $otherUser->profile_photo_url ?? null,
        'last_message' => $latestMessage ? $latestMessage->content : '',
        'last_message_time' => $latestMessage ? $latestMessage->created_at : null,
        'unread_count' => $unreadCount
    ];
}

echo "Final conversations: " . json_encode($conversations, JSON_UNESCAPED_UNICODE) . "\n";