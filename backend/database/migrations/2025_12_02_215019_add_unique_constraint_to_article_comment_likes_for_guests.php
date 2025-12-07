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
        Schema::table('article_comment_likes', function (Blueprint $table) {
            // Add unique constraint for guest users (session_id + comment_id)
            $table->unique(['session_id', 'comment_id'], 'comment_likes_session_comment_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_comment_likes', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique('comment_likes_session_comment_unique');
        });
    }
};