<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('forum_topics', function (Blueprint $table) {
            if (! Schema::hasColumn('forum_topics', 'status')) {
                $table->string('status')->default('approved')->after('slug');
            }
            if (! Schema::hasColumn('forum_topics', 'is_pinned')) {
                $table->boolean('is_pinned')->default(false)->after('status');
            }
            if (! Schema::hasColumn('forum_topics', 'moderated_by')) {
                $table->foreignId('moderated_by')->nullable()->after('is_pinned')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('forum_topics', 'moderated_at')) {
                $table->timestamp('moderated_at')->nullable()->after('moderated_by');
            }
        });
    }

    public function down()
    {
        Schema::table('forum_topics', function (Blueprint $table) {
            if (Schema::hasColumn('forum_topics', 'moderated_at')) {
                $table->dropColumn('moderated_at');
            }
            if (Schema::hasColumn('forum_topics', 'moderated_by')) {
                $table->dropForeign(['moderated_by']);
                $table->dropColumn('moderated_by');
            }
            if (Schema::hasColumn('forum_topics', 'is_pinned')) {
                $table->dropColumn('is_pinned');
            }
            if (Schema::hasColumn('forum_topics', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};