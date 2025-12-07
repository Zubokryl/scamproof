<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'role', 'reputation', 
        'trusted_badge', 'two_factor_secret', 'two_factor_enabled',
        'last_password_change_at', 'account_status', 'failed_login_attempts',
        'bio', 'social_links', 'timezone', 'locale', 'notification_settings',
        'favorites', 'blocked_users', 'last_active'
    ];

    protected $hidden = [
        'password', 'remember_token', 'two_factor_secret'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'social_links' => 'array',
        'notification_settings' => 'array',
        'favorites' => 'array',
        'blocked_users' => 'array',
        'two_factor_enabled' => 'boolean',
        'trusted_badge' => 'boolean',
        'remember_token' => 'string',
        'last_active' => 'datetime'
    ];

    // Связи
    public function sentMessages() {
        return $this->hasMany(PrivateMessage::class, 'sender_id');
    }

    public function receivedMessages() {
        return $this->hasMany(PrivateMessage::class, 'receiver_id');
    }

    public function badges() {
        return $this->hasMany(UserBadge::class);
    }

    public function followers() {
        return $this->belongsToMany(User::class, 'user_follows', 'followed_id', 'follower_id');
    }

    public function following() {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'followed_id');
    }

    public function activityLogs() {
        return $this->hasMany(UserActivityLog::class);
    }

    public function logins() {
        return $this->hasMany(UserLogin::class);
    }

    public function mutedUsers() {
        return $this->belongsToMany(User::class, 'muted_users', 'user_id', 'muted_user_id');
    }

    public function isAdmin(): bool
{
    return $this->role === 'admin';
}

public function isUser(): bool
{
    return $this->role === 'user';
}

}