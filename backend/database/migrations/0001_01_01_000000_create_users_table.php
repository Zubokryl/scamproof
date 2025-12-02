<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Таблица пользователей
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Никнейм
            $table->string('email')->unique(); // Уникальный email
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('role', ['user', 'moderator', 'admin'])->default('user');
            $table->integer('reputation')->default(0);
            $table->string('two_factor_secret')->nullable(); // для 2FA
            $table->boolean('two_factor_enabled')->default(false); // включён ли 2FA
            $table->timestamp('last_password_change_at')->nullable();
            $table->enum('account_status', ['active', 'banned', 'suspended', 'pending'])->default('active');
            $table->integer('failed_login_attempts')->default(0);
            $table->text('bio')->nullable();
            $table->json('social_links')->nullable(); // ссылки на соцсети
            $table->string('timezone')->default('UTC');
            $table->string('locale')->default('en');
            $table->json('notification_settings')->nullable();
            $table->json('favorites')->nullable();
            $table->json('blocked_users')->nullable();
            $table->integer('reputation_expert')->default(0);
            $table->integer('reputation_helped')->default(0);
            $table->boolean('trusted_badge')->default(false);

            $table->rememberToken();
            $table->timestamps();
        });

        // Личные сообщения
        Schema::create('private_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // Бейджи и достижения
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('badge_type'); // тип бейджа
            $table->string('title');
            $table->string('icon')->nullable();
            $table->timestamp('awarded_at')->nullable();
            $table->timestamps();
        });

        // Подписки / друзья
        Schema::create('user_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('followed_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // История активности
        Schema::create('user_activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // например, "создал тему", "оставил комментарий"
            $table->string('target_type')->nullable(); // Article, Comment, ForumPost и т.д.
            $table->unsignedBigInteger('target_id')->nullable();
            $table->timestamps();
        });

        // История логинов
        Schema::create('user_logins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->string('device')->nullable();
            $table->timestamp('logged_in_at')->useCurrent();
            $table->timestamps();
        });

        // Заблокированные / замьюченные пользователи
        Schema::create('muted_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('muted_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('muted_users');
        Schema::dropIfExists('user_logins');
        Schema::dropIfExists('user_activity_log');
        Schema::dropIfExists('user_follows');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('private_messages');
        Schema::dropIfExists('users');
    }
};
