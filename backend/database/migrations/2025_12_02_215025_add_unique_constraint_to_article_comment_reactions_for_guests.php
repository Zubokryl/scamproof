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
            // Add unique constraint for guest users (session_id + comment_id + reaction_type)
            $table->unique(['session_id', 'comment_id', 'reaction_type'], 'comment_reactions_session_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_comment_reactions', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique('comment_reactions_session_unique');
        });
    }
};