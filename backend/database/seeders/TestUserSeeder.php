<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users
        $testUsers = [
            [
                'name' => 'sveta777',
                'email' => 'sveta777@gmail.com',
                'password' => Hash::make('sveta777password'),
                'role' => 'user',
            ],
            [
                'name' => 'nick000',
                'email' => 'nick000@gmail.com',
                'password' => Hash::make('nick000password'),
                'role' => 'user',
            ],
        ];

        foreach ($testUsers as $userData) {
            // Check if user already exists
            $existingUser = User::where('email', $userData['email'])->first();
            
            if (!$existingUser) {
                User::create($userData);
            }
        }
    }
}