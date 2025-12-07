<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProof extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'file_path', 'verified'];

    protected $casts = [
        'verified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Методы верификации
    public function verifyByModerator()
    {
        $this->verified = true;
        $this->save();
        // Начисление очков репутации
        $this->user->increment('reputation_expert', 10);
        // Выдача бейджа "proven_user" при первом подтверждении
        if (!$this->user->badges()->where('badge_type', 'proven_user')->exists()) {
            $this->user->badges()->create([
                'badge_type' => 'proven_user',
                'title' => 'Доказанный пользователь',
            ]);
        }
    }

    public function verifyByUser()
    {
        $this->verified = true;
        $this->save();
        // Начисление очков "helped others" пользователю, который подтвердил
        // Пример: $verifier->increment('reputation_helped', 5);
    }
}
