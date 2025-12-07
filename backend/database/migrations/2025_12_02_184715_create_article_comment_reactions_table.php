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
        // Check if table exists before creating it
        if (!Schema::hasTable('article_comment_reactions')) {
            Schema::create('article_comment_reactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('comment_id')->constrained('article_comments')->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('reaction_type'); // e.g., 'like', 'dislike', 'laugh', 'angry', etc.
                $table->timestamps();
                
                // Ensure a user can only react once per comment per reaction type
                $table->unique(['comment_id', 'user_id', 'reaction_type'], 'comment_user_reaction_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_comment_reactions');
    }
};