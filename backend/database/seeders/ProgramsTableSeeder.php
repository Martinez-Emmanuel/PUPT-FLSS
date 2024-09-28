<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('programs')->insert([
            [
                'program_id' => 1,
                'program_code' => 'BSIT',
                'program_title' => 'Bachelor of Science in Information Technology',
                'program_info' => 'Focuses on information technology and its applications.',
                'number_of_years' => 4,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_id' => 2,
                'program_code' => 'BSME',
                'program_title' => 'Bachelor of Science in Mechanical Engineering',
                'program_info' => 'Focuses on mechanical engineering principles and practices.',
                'number_of_years' => 4,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
