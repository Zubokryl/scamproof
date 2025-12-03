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
        // Add indexes to articles table for better query performance
        Schema::table('articles', function (Blueprint $table) {
            // Index for published articles query
            if (!Schema::hasIndex('articles', 'articles_published_at_index')) {
                $table->index('published_at');
            }
            // Index for category filtering
            if (!Schema::hasIndex('articles', 'articles_category_id_index')) {
                $table->index('category_id');
            }
            // Composite index for category and published_at for better performance
            if (!Schema::hasIndex('articles', 'articles_category_published_index')) {
                $table->index(['category_id', 'published_at']);
            }
            // Index for author filtering
            if (!Schema::hasIndex('articles', 'articles_created_by_index')) {
                $table->index('created_by');
            }
        });

        // Add indexes to article_comments table for better query performance
        Schema::table('article_comments', function (Blueprint $table) {
            // Index for getting comments by article
            if (!Schema::hasIndex('article_comments', 'article_comments_article_id_index')) {
                $table->index('article_id');
            }
            // Index for getting comments by user
            if (!Schema::hasIndex('article_comments', 'article_comments_user_id_index')) {
                $table->index('user_id');
            }
            // Index for ordering by creation date
            if (!Schema::hasIndex('article_comments', 'article_comments_created_at_index')) {
                $table->index('created_at');
            }
            // Note: Skipping status index as it already exists
        });

        // Add indexes to article_likes table for better query performance
        Schema::table('article_likes', function (Blueprint $table) {
            // Index for getting likes by article
            if (!Schema::hasIndex('article_likes', 'article_likes_article_id_index')) {
                $table->index('article_id');
            }
            // Index for getting likes by user
            if (!Schema::hasIndex('article_likes', 'article_likes_user_id_index')) {
                $table->index('user_id');
            }
            // Index for ordering by creation date
            if (!Schema::hasIndex('article_likes', 'article_likes_created_at_index')) {
                $table->index('created_at');
            }
        });

        // Add indexes to article_comment_likes table
        Schema::table('article_comment_likes', function (Blueprint $table) {
            // Index for getting likes by comment
            if (!Schema::hasIndex('article_comment_likes', 'article_comment_likes_comment_id_index')) {
                $table->index('comment_id');
            }
            // Index for getting likes by user
            if (!Schema::hasIndex('article_comment_likes', 'article_comment_likes_user_id_index')) {
                $table->index('user_id');
            }
        });

        // Add indexes to article_comment_reactions table
        Schema::table('article_comment_reactions', function (Blueprint $table) {
            // Index for getting reactions by comment
            if (!Schema::hasIndex('article_comment_reactions', 'article_comment_reactions_comment_id_index')) {
                $table->index('comment_id');
            }
            // Index for getting reactions by user
            if (!Schema::hasIndex('article_comment_reactions', 'article_comment_reactions_user_id_index')) {
                $table->index('user_id');
            }
            // Index for getting reactions by type
            if (!Schema::hasIndex('article_comment_reactions', 'article_comment_reactions_reaction_type_index')) {
                $table->index('reaction_type');
            }
        });

        // Add indexes to categories table
        Schema::table('categories', function (Blueprint $table) {
            // Index for slug lookups
            if (!Schema::hasIndex('categories', 'categories_slug_index')) {
                $table->index('slug');
            }
            // Index for landing enabled
            if (!Schema::hasIndex('categories', 'categories_landing_enabled_index')) {
                $table->index('landing_enabled');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from articles table
        Schema::table('articles', function (Blueprint $table) {
            if (Schema::hasIndex('articles', 'articles_published_at_index')) {
                $table->dropIndex(['published_at']);
            }
            if (Schema::hasIndex('articles', 'articles_category_id_index')) {
                $table->dropIndex(['category_id']);
            }
            if (Schema::hasIndex('articles', 'articles_category_published_index')) {
                $table->dropIndex(['category_id', 'published_at']);
            }
            if (Schema::hasIndex('articles', 'articles_created_by_index')) {
                $table->dropIndex(['created_by']);
            }
        });

        // Drop indexes from article_comments table
        Schema::table('article_comments', function (Blueprint $table) {
            if (Schema::hasIndex('article_comments', 'article_comments_article_id_index')) {
                $table->dropIndex(['article_id']);
            }
            if (Schema::hasIndex('article_comments', 'article_comments_user_id_index')) {
                $table->dropIndex(['user_id']);
            }
            if (Schema::hasIndex('article_comments', 'article_comments_created_at_index')) {
                $table->dropIndex(['created_at']);
            }
            // Note: Not dropping status index in rollback
        });

        // Drop indexes from article_likes table
        Schema::table('article_likes', function (Blueprint $table) {
            if (Schema::hasIndex('article_likes', 'article_likes_article_id_index')) {
                $table->dropIndex(['article_id']);
            }
            if (Schema::hasIndex('article_likes', 'article_likes_user_id_index')) {
                $table->dropIndex(['user_id']);
            }
            if (Schema::hasIndex('article_likes', 'article_likes_created_at_index')) {
                $table->dropIndex(['created_at']);
            }
        });

        // Drop indexes from article_comment_likes table
        Schema::table('article_comment_likes', function (Blueprint $table) {
            if (Schema::hasIndex('article_comment_likes', 'article_comment_likes_comment_id_index')) {
                $table->dropIndex(['comment_id']);
            }
            if (Schema::hasIndex('article_comment_likes', 'article_comment_likes_user_id_index')) {
                $table->dropIndex(['user_id']);
            }
        });

        // Drop indexes from article_comment_reactions table
        Schema::table('article_comment_reactions', function (Blueprint $table) {
            if (Schema::hasIndex('article_comment_reactions', 'article_comment_reactions_comment_id_index')) {
                $table->dropIndex(['comment_id']);
            }
            if (Schema::hasIndex('article_comment_reactions', 'article_comment_reactions_user_id_index')) {
                $table->dropIndex(['user_id']);
            }
            if (Schema::hasIndex('article_comment_reactions', 'article_comment_reactions_reaction_type_index')) {
                $table->dropIndex(['reaction_type']);
            }
        });

        // Drop indexes from categories table
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasIndex('categories', 'categories_slug_index')) {
                $table->dropIndex(['slug']);
            }
            if (Schema::hasIndex('categories', 'categories_landing_enabled_index')) {
                $table->dropIndex(['landing_enabled']);
            }
        });
    }
};