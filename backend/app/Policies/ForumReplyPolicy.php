<?php

namespace App\Policies;

use App\Models\ForumReply;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ForumReplyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Anyone can view replies
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ForumReply $forumReply): bool
    {
        return true; // Anyone can view a reply
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user !== null; // Any authenticated user can create replies
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ForumReply $forumReply): bool
    {
        return $user->id === $forumReply->user_id || in_array($user->role, ['admin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ForumReply $forumReply): bool
    {
        return $user->id === $forumReply->user_id || in_array($user->role, ['admin']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ForumReply $forumReply): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ForumReply $forumReply): bool
    {
        return false;
    }
}