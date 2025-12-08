<?php

namespace App\Events;

use App\Models\PrivateMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class PrivateMessageSent implements ShouldBroadcast
{
    public $message;

    public function __construct(PrivateMessage $message)
    {
        $this->message = $message->load('sender:id,name,avatar');
    }

    public function broadcastOn()
    {
        return new PrivateChannel('chat.' . $this->message->receiver_id);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}