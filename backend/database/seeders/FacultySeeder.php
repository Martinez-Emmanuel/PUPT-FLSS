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
        // Creating Users with 'active' status
        $user1 = User::create([
            'name' => 'Steven Villarosa',
            'code' => 'FA1234TG2023',
            'password' => 'facultypass', // Password will be hashed by the model mutator
            'role' => 'faculty',
            'status' => 'active', // Set status to active
        ]);

        $user2 = User::create([
            'name' => 'Marissa Ferrer',
            'code' => 'ADM001TG2024',
            'password' => 'adminpass', // Password will be hashed by the model mutator
            'role' => 'admin',
            'status' => 'active', // Set status to active
        ]);

        $user3 = User::create([
            'name' => 'Ermmanuel Martinez',
            'code' => 'SDM001TG2024',
            'password' => 'superadminpass', // Password will be hashed by the model mutator
            'role' => 'superadmin',
            'status' => 'active', // Set status to active
        ]);

        $user4 = User::create([
            'name' => 'Adrian Naoe',
            'code' => 'SDM002TG2024',
            'password' => 'TEST123', // Password will be hashed by the model mutator
            'role' => 'faculty',
            'status' => 'active', // Set status to active
        ]);

        $user5 = User::create([
            'name' => 'Kyla Malaluan',
            'code' => 'SDM003TG2024',
            'password' => 'TEST123', // Password will be hashed by the model mutator
            'role' => 'faculty',
            'status' => 'active', // Set status to active
        ]);

        $user6 = User::create([
            'name' => 'Via Rasquero',
            'code' => 'SDM004TG2024',
            'password' => 'TEST123', // Password will be hashed by the model mutator
            'role' => 'superadmin',
            'status' => 'active', // Set status to active
        ]);

        // Creating Faculties
        Faculty::create([
            'user_id' => $user1->id,
            'faculty_email' => 'ssvillarosa@example.com',
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
            'faculty_type' => 'regular',
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user4->id,
            'faculty_email' => 'adrianxample@gmail.com',
            'faculty_type' => 'regular',
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user5->id,
            'faculty_email' => 'kylaxample@gmail.com',
            'faculty_type' => 'part-time',
            'faculty_unit' => '18',
        ]);

        Faculty::create([
            'user_id' => $user6->id,
            'faculty_email' => 'viarasqueroxample@gmail.com',
            'faculty_type' => 'part-time',
            'faculty_unit' => '18',
        ]);
    }
}
