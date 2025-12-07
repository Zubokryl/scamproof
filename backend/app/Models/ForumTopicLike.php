<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumTopicLike extends Model
{
    protected $fillable = [
        'topic_id',
        'user_id',
    ];

    public function topic()
    {
        return $this->belongsTo(ForumTopic::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}