<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if the admin user already exists
        $adminUser = User::where('name', 'Zubokryl777')->where('email', 'zubokryl777@example.com')->first();
        
        if ($adminUser) {
            // If user exists, update their role and password
            $adminUser->update([
                'password' => Hash::make('ArikMarik888'),
                'role' => 'admin',
            ]);
        } else {
            // If user doesn't exist, create them
            User::create([
                'name' => 'Zubokryl777',
                'email' => 'zubokryl777@example.com',
                'password' => Hash::make('ArikMarik888'),
                'role' => 'admin',
            ]);
        }
    }
}