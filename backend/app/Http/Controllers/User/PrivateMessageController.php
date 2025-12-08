<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\PrivateMessageStoreRequest;
use App\Models\PrivateMessage;
use App\Http\Resources\PrivateMessageResource;
use App\Events\PrivateMessageSent;
use Illuminate\Http\Request;

class PrivateMessageController extends Controller
{
    // Список сообщений текущего пользователя
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $messages = PrivateMessage::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->get();

        return PrivateMessageResource::collection($messages);
    }

    // Отправить личное сообщение
    public function store(PrivateMessageStoreRequest $request)
    {
        $sender = $request->user();
        $data = $request->validated();

        // Create message with correct field names
        $message = PrivateMessage::create([
            'sender_id' => $sender->id,
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'],
            'is_read' => false,
        ]);

        // Load relationships for response
        $message->load(['sender', 'receiver']);

        // Broadcast the message
        broadcast(new PrivateMessageSent($message))->toOthers();

        return new PrivateMessageResource($message);
    }

    // Получить переписку между текущим пользователем и другим пользователем
    public function getConversation(Request $request, $otherUserId)
    {
        $currentUserId = $request->user()->id;

        // Get messages between these two users
        $messages = PrivateMessage::where(function($query) use ($currentUserId, $otherUserId) {
            $query->where('sender_id', $currentUserId)
                  ->where('receiver_id', $otherUserId);
        })->orWhere(function($query) use ($currentUserId, $otherUserId) {
            $query->where('sender_id', $otherUserId)
                  ->where('receiver_id', $currentUserId);
        })
        ->with(['sender', 'receiver'])
        ->orderBy('created_at', 'asc')
        ->get();

        // Mark received messages as read
        PrivateMessage::where('receiver_id', $currentUserId)
            ->where('sender_id', $otherUserId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return PrivateMessageResource::collection($messages);
    }

    // Получить список всех бесед пользователя
    public function getConversations(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('getConversations method called');
            
            // Check if user is authenticated
            if (!$request->user()) {
                \Illuminate\Support\Facades\Log::info('User not authenticated');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $userId = $request->user()->id;
            \Illuminate\Support\Facades\Log::info('getConversations called by user: ' . $userId);

            // Get all unique users that the current user has messaged or received messages from
            \Illuminate\Support\Facades\Log::info('Querying for conversation partners');
            $userIds = PrivateMessage::where('sender_id', $userId)
                ->pluck('receiver_id')
                ->merge(
                    PrivateMessage::where('receiver_id', $userId)
                        ->pluck('sender_id')
                )
                ->unique()
                ->values();

            \Illuminate\Support\Facades\Log::info('Found conversation partners: ', ['user_ids' => $userIds->toArray()]);

            // Get the latest message for each conversation
            $conversations = [];
            foreach ($userIds as $otherUserId) {
                \Illuminate\Support\Facades\Log::info('Processing user: ' . $otherUserId);
                
                // Get the other user details
                $otherUser = \App\Models\User::find($otherUserId);
                if (!$otherUser) {
                    \Illuminate\Support\Facades\Log::warning('User not found: ' . $otherUserId);
                    continue;
                }

                // Get the latest message between these two users
                \Illuminate\Support\Facades\Log::info('Querying for latest message between ' . $userId . ' and ' . $otherUserId);
                $latestMessage = PrivateMessage::where(function($query) use ($userId, $otherUserId) {
                    $query->where('sender_id', $userId)
                          ->where('receiver_id', $otherUserId);
                })->orWhere(function($query) use ($userId, $otherUserId) {
                    $query->where('sender_id', $otherUserId)
                          ->where('receiver_id', $userId);
                })->orderBy('created_at', 'desc')
                  ->first();
                \Illuminate\Support\Facades\Log::info('Latest message found: ' . ($latestMessage ? 'yes' : 'no'));

                // Count unread messages from this user
                \Illuminate\Support\Facades\Log::info('Counting unread messages from user ' . $otherUserId);
                $unreadCount = PrivateMessage::where('receiver_id', $userId)
                    ->where('sender_id', $otherUserId)
                    ->where('is_read', false)
                    ->count();
                \Illuminate\Support\Facades\Log::info('Unread count: ' . $unreadCount);

                $conversations[] = [
                    'user_id' => $otherUserId,
                    'user_name' => $otherUser->name,
                    'user_avatar' => $otherUser->profile_photo_url ?? null,
                    'last_message' => $latestMessage ? $latestMessage->content : '',
                    'last_message_time' => $latestMessage ? $latestMessage->created_at : null,
                    'unread_count' => $unreadCount
                ];
            }

            // Sort by last message time (newest first)
            \Illuminate\Support\Facades\Log::info('Sorting conversations');
            usort($conversations, function($a, $b) {
                return strtotime($b['last_message_time'] ?? '') <=> strtotime($a['last_message_time'] ?? '');
            });

            \Illuminate\Support\Facades\Log::info('Returning conversations: ', ['count' => count($conversations)]);
            return response()->json($conversations);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in getConversations: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
            return response()->json(['error' => 'Failed to fetch conversations', 'message' => $e->getMessage()], 500);
        }
    }

    // Пометить сообщение как прочитанное
    public function markAsRead($id)
    {
        $message = PrivateMessage::findOrFail($id);
        $message->is_read = true;
        $message->save();

        return new PrivateMessageResource($message);
    }
    
    // Show a specific message
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;
        
        $message = PrivateMessage::where('id', $id)
            ->where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('receiver_id', $userId);
            })
            ->with(['sender', 'receiver'])
            ->firstOrFail();

        // Mark as read if recipient is viewing
        if ($message->receiver_id == $userId && !$message->is_read) {
            $message->is_read = true;
            $message->save();
        }

        return new PrivateMessageResource($message);
    }
    
    // Delete a message
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        
        $message = PrivateMessage::where('id', $id)
            ->where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('receiver_id', $userId);
            })
            ->firstOrFail();

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}