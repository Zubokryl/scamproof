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
            
            // Add session_id column if it doesn't exist
            if (!Schema::hasColumn('article_comment_reactions', 'session_id')) {
                $table->string('session_id')->nullable()->after('user_id');
            }
            
            // Check if indexes exist before adding them
            // We'll handle index creation separately to avoid duplication issues
        });
        
        // Add indexes separately to avoid duplication issues
        try {
            Schema::table('article_comment_reactions', function (Blueprint $table) {
                // Check existing indexes
                $indexes = \Illuminate\Support\Facades\DB::select("SHOW INDEX FROM article_comment_reactions WHERE Key_name IN ('comment_reactions_session_idx', 'comment_reactions_type_idx')");
                $existingIndexes = collect($indexes)->pluck('Key_name')->toArray();
                
                if (!in_array('comment_reactions_session_idx', $existingIndexes)) {
                    $table->index(['session_id', 'comment_id'], 'comment_reactions_session_idx');
                }
                
                if (!in_array('comment_reactions_type_idx', $existingIndexes)) {
                    $table->index(['reaction_type'], 'comment_reactions_type_idx');
                }
            });
        } catch (\Exception $e) {
            // Index might already exist, continue
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_comment_reactions', function (Blueprint $table) {
            // Try to drop indexes
            try {
                $table->dropIndex('comment_reactions_session_idx');
            } catch (\Exception $e) {
                // Index might not exist, continue
            }
            
            try {
                $table->dropIndex('comment_reactions_type_idx');
            } catch (\Exception $e) {
                // Index might not exist, continue
            }
            
            // Drop session_id column if it exists
            if (Schema::hasColumn('article_comment_reactions', 'session_id')) {
                $table->dropColumn('session_id');
            }
            
            // Revert user_id to not nullable if no records have null user_id
            $nullUserCount = \Illuminate\Support\Facades\DB::table('article_comment_reactions')->whereNull('user_id')->count();
            if ($nullUserCount == 0) {
                $table->unsignedBigInteger('user_id')->nullable(false)->change();
            }
        });
    }
};