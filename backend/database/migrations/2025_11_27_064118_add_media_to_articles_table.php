<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('thumbnail')->nullable()->after('content'); // Фото-превью
            $table->string('video_url')->nullable()->after('thumbnail'); // Видео (mp4/webm)
        });
    }

    public function down(): void {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn(['thumbnail', 'video_url']);
        });
    }
};
