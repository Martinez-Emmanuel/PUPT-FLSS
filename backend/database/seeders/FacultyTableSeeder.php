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
                'faculty_type' => 'full-time',
                'faculty_unit' => '25',
            ],
            [
                'id' => 2,
                'user_id' => 4,
                'faculty_email' => 'Adriannaoe7@gmail.com',
                'faculty_type' => 'part-time',
                'faculty_unit' => '25',
            ],
            [
                'id' => 3,
                'user_id' => 5,
                'faculty_email' => 'kyla.malaluan@example.com',
                'faculty_type' => 'full-time',
                'faculty_unit' => '25',
            ],
            [
                'id' => 4,
                'user_id' => 6,
                'faculty_email' => 'via.rasquero@example.com',
                'faculty_type' => 'regular',
                'faculty_unit' => '25',
            ],
        ]);
    }
}
