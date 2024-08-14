<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faculty;
use Illuminate\Support\Facades\Hash;
use App\Models\User;   


class FacultySeeder extends Seeder
{
    /**
     * Seed the faculties table.
     *
     * @return void
     */
    public function run(): void
    {
    // Creating Users
    $user1 = User::create([
        'name' => 'Steven Villarosa',
        'code' => 'FA1234TG2023',
        'password' => '#Q!FR&334', // Password will be hashed by the model mutator
        'role' => 'faculty',
    ]);

    $user2 = User::create([
        'name' => 'Marissa Ferrer',
        'code' => 'ADM001TG2024',
        'password' => '$z7g235Y1', // Password will be hashed by the model mutator
        'role' => 'admin',
    ]);

    $user3 = User::create([
        'name' => 'Ermmanuel Martinez',
        'code' => 'SDM001TG2024',
        'password' => '!7DQK95#', // Password will be hashed by the model mutator
        'role' => 'superadmin',
    ]);

        // Creating Faculties
        Faculty::create([
            'user_id' => $user1->id,
            'faculty_email' => 'ssvillarosa@example.com',
            'faculty_type' => 'part-time',
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user1->id,
            'faculty_email' => 'andreasnaoe@gmail.com',
            'faculty_type' => 'part-time',
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user2->id,
            'faculty_email' => 'maria.clara@example.com',
            'faculty_type' => 'full-time',
            'faculty_unit' => '30',
        ]);

        Faculty::create([
            'user_id' => $user3->id,
            'faculty_email' => 'alice.johnson@example.com',
            'faculty_type' => 'regular',  // Changed 'temporary' to 'regular' to match ENUM
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user3->id,
            'faculty_email' => 'bob.brown@example.com',
            'faculty_type' => 'regular',
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user2->id,
            'faculty_email' => 'carol.white@example.com',
            'faculty_type' => 'full-time',
            'faculty_unit' => '30',
        ]);
    }
}
