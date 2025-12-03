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
        Schema::table('article_comment_reactions', function (Blueprint $table) {
            // Make user_id nullable to allow guest reactions
            $table->unsignedBigInteger('user_id')->nullable()->change();
            
            // Add indexes for better performance with shorter names if they don't exist
            if (!Schema::hasColumn('article_comment_reactions', 'session_id')) {
                $table->string('session_id')->nullable()->after('user_id');
                $table->index(['session_id', 'comment_id'], 'comment_reactions_session_idx');
            }
            
            // Check if indexes exist before adding them
            $indexes = \DB::select("SHOW INDEX FROM article_comment_reactions WHERE Key_name IN ('comment_reactions_session_idx', 'comment_reactions_type_idx')");
            $existingIndexes = collect($indexes)->pluck('Key_name')->toArray();
            
            if (!in_array('comment_reactions_session_idx', $existingIndexes)) {
                $table->index(['session_id', 'comment_id'], 'comment_reactions_session_idx');
            }
            
            if (!in_array('comment_reactions_type_idx', $existingIndexes)) {
                $table->index(['reaction_type'], 'comment_reactions_type_idx');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_comment_reactions', function (Blueprint $table) {
            // Check if indexes exist before dropping them
            $indexes = \DB::select("SHOW INDEX FROM article_comment_reactions WHERE Key_name IN ('comment_reactions_session_idx', 'comment_reactions_type_idx')");
            $existingIndexes = collect($indexes)->pluck('Key_name')->toArray();
            
            if (in_array('comment_reactions_session_idx', $existingIndexes)) {
                $table->dropIndex('comment_reactions_session_idx');
            }
            
            if (in_array('comment_reactions_type_idx', $existingIndexes)) {
                $table->dropIndex('comment_reactions_type_idx');
            }
            
            // Revert user_id to not nullable
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};