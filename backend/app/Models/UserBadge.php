<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    protected $fillable = ['user_id', 'badge_type', 'title', 'icon', 'awarded_at'];

    protected $casts = [
        'awarded_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    // Типы бейджей
    const PROVEN_USER = 'proven_user';
    const EXPERT = 'expert';
    const HELPED_OTHERS = 'helped_others';
    const MODERATOR_TRUST = 'moderator_trust';
}
