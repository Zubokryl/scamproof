<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the role column to remove 'moderator' option
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
        
        // Update existing moderator users to become regular users
        DB::table('users')->where('role', 'moderator')->update(['role' => 'user']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the 'moderator' option
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'moderator', 'admin') DEFAULT 'user'");
    }
};