<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ForumTopic;

class ForumTopicPolicy
{

    public function create(User $user)
    {
        return $user !== null; // любому аутентифицированному пользователю разрешено создавать темы
    }

    public function update(User $user, ForumTopic $topic)
    {
        return $user->id === $topic->author_id || in_array($user->role, ['admin']);
    }

    public function delete(User $user, ForumTopic $topic)
    {
        return $user->id === $topic->author_id || in_array($user->role, ['admin']);
    }
}