<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\PrivateMessageStoreRequest;
use App\Models\PrivateMessage;
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

        return response()->json($messages);
    }

    // Отправить личное сообщение
    public function store(PrivateMessageStoreRequest $request)
    {
        $sender = $request->user();
        $data = $request->validated();

        // Предполагается, что у пользователя есть relation sentMessages (или используем модель напрямую)
        $message = PrivateMessage::create([
            'sender_id' => $sender->id,
            'recipient_id' => $data['recipient_id'],
            'subject' => $data['subject'] ?? null,
            'body' => $data['body'],
        ]);

        return response()->json($message, 201);
    }

    // Пометить сообщение как прочитанное
    public function markAsRead($id)
    {
        $message = PrivateMessage::findOrFail($id);
        $message->is_read = true;
        $message->save();

        return response()->json($message);
    }
}
