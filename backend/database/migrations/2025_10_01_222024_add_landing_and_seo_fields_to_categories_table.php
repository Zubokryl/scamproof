<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('categories', function (Blueprint $table) {
            // Поля для лендингов
            $table->boolean('landing_enabled')->default(false)->after('icon');
            $table->string('landing_title', 255)->nullable()->after('landing_enabled');
            $table->text('landing_content')->nullable()->after('landing_title');
            $table->string('landing_template', 50)->default('default')->after('landing_content');
            
            // SEO метатеги
            $table->string('meta_title', 255)->nullable()->after('landing_template');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('meta_keywords', 500)->nullable()->after('meta_description');
            
            // Для связи с форумом
            $table->string('forum_section_slug', 100)->nullable()->after('meta_keywords');
        });
    }

    public function down()
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'landing_enabled', 'landing_title', 'landing_content', 'landing_template',
                'meta_title', 'meta_description', 'meta_keywords', 'forum_section_slug'
            ]);
        });
    }
};