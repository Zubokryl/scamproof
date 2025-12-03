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
            // Make user_id nullable to allow guest likes
            $table->unsignedBigInteger('user_id')->nullable()->change();
            
            // Add session_id column and index if they don't exist
            if (!Schema::hasColumn('article_comment_likes', 'session_id')) {
                $table->string('session_id')->nullable()->after('user_id');
                $table->index(['session_id', 'comment_id'], 'comment_likes_session_idx');
            } else {
                // Just add the index if it doesn't exist
                $indexes = \DB::select("SHOW INDEX FROM article_comment_likes WHERE Key_name = 'comment_likes_session_idx'");
                if (empty($indexes)) {
                    $table->index(['session_id', 'comment_id'], 'comment_likes_session_idx');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_comment_likes', function (Blueprint $table) {
            // Check if index exists before dropping it
            $indexes = \DB::select("SHOW INDEX FROM article_comment_likes WHERE Key_name = 'comment_likes_session_idx'");
            if (!empty($indexes)) {
                $table->dropIndex('comment_likes_session_idx');
            }
            
            // Revert user_id to not nullable
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};