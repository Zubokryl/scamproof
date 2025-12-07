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
        Schema::table('article_likes', function (Blueprint $table) {
            // Add unique constraint for guest users (session_id + article_id)
            $table->unique(['session_id', 'article_id'], 'article_likes_session_article_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_likes', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique('article_likes_session_article_unique');
        });
    }
};