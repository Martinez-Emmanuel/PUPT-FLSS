<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faculty;
use Illuminate\Support\Facades\Hash;

class FacultySeeder extends Seeder
{
    /**
     * Seed the faculties table.
     *
     * @return void
     */
    public function run()
    {
        Faculty::create([
            'faculty_name' => 'Juan Dela Cruz',
            'faculty_code' => 'FA1234TG2024',
            'faculty_password' => 'password123', 
            'faculty_email' => 'juan.delacruz@example.com',
            'faculty_type' => 'lecturer'
        ]);

        Faculty::create([
            'faculty_name' => 'Maria Clara',
            'faculty_code' => 'FA2345TG2024',
            'faculty_password' => 'password234', 
            'faculty_email' => 'maria.clara@example.com',
            'faculty_type' => 'lecturer'
        ]);

        Faculty::create([
            'faculty_name' => 'Alice Johnson',
            'faculty_code' => 'FA3456TG2024',
            'faculty_password' => 'password345', 
            'faculty_email' => 'alice.johnson@example.com',
            'faculty_type' => 'lecturer'
        ]);

        Faculty::create([
            'faculty_name' => 'Bob Brown',
            'faculty_code' => 'FA4567TG2024',
            'faculty_password' => 'password456', 
            'faculty_email' => 'bob.brown@example.com',
            'faculty_type' => 'lecturer'
        ]);

        Faculty::create([
            'faculty_name' => 'Carol White',
            'faculty_code' => 'FA5678TG2024',
            'faculty_password' => 'newpassword123', 
            'faculty_email' => 'carol.white@example.com',
            'faculty_type' => 'lecturer'
        ]);
    }
}
