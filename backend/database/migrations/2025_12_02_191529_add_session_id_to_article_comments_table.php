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
        Schema::table('article_comments', function (Blueprint $table) {
            $table->string('session_id')->nullable()->after('user_id');
            
            // Add indexes for better performance
            $table->index(['session_id', 'article_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_comments', function (Blueprint $table) {
            $table->dropIndex(['session_id', 'article_id']);
            $table->dropColumn('session_id');
        });
    }
};