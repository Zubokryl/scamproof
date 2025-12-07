<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('article_comments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('content');
            $table->unsignedBigInteger('moderated_by')->nullable()->after('status');
            $table->timestamp('moderated_at')->nullable()->after('moderated_by');
            $table->text('moderation_note')->nullable()->after('moderated_at');
            
            // Индекс для связи с модератором
            $table->foreign('moderated_by')->references('id')->on('users')->onDelete('set null');
            
            // Индекс для быстрого поиска по статусу
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::table('article_comments', function (Blueprint $table) {
            $table->dropForeign(['moderated_by']);
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'moderated_by', 'moderated_at', 'moderation_note']);
        });
    }
};