<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacultyTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('faculty')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'faculty_email' => 'emmanuellmartinez013@gmail.com',
                'faculty_type' => 'Full-time (Permanent)',
                'faculty_units' => '25',
            ],
            [
                'id' => 2,
                'user_id' => 4,
                'faculty_email' => 'adrian.naoe@example.com',
                'faculty_type' => 'Part-time',
                'faculty_units' => '25',
            ],
            [
                'id' => 3,
                'user_id' => 5,
                'faculty_email' => 'kyla.malaluan@example.com',
                'faculty_type' => 'Full-time (Temporary)',
                'faculty_units' => '25',
            ],
            [
                'id' => 4,
                'user_id' => 6,
                'faculty_email' => 'via.rasquero@example.com',
                'faculty_type' => 'Full-time (Designee)',
                'faculty_units' => '25',
            ],
        ]);
    }
}
