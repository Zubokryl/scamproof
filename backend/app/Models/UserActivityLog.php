<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserActivityLog extends Model
{
    protected $table = 'user_activity_log';
    
    protected $fillable = ['user_id', 'action', 'target_type', 'target_id'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public static function logActivity($user, $action, $targetType, $targetId)
    {
        return self::create([
            'user_id' => $user->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId
        ]);
    }

}
