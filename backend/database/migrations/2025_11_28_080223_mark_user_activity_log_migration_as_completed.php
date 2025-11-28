<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert the migration record into the migrations table
        DB::table('migrations')->insert([
            'migration' => '2025_11_28_074250_create_user_activity_log_table',
            'batch' => DB::table('migrations')->max('batch') + 1
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the migration record from the migrations table
        DB::table('migrations')
            ->where('migration', '2025_11_28_074250_create_user_activity_log_table')
            ->delete();
    }
};
