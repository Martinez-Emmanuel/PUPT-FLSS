<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;

class ProgramsTableSeeder extends Seeder
{
    public function run()
    {
        Program::create([
            'program_code' => 'BSIT',
            'program_title' => 'Bachelor of Science in Information Technology',
            'program_info' => 'Focuses on information technology and its applications.',
            'status' => 'active',
            'number_of_years' => 4
        ]);

        Program::create([
            'program_code' => 'BSA',
            'program_title' => 'Bachelor of Science in Accountancy',
            'program_info' => 'Focuses on accounting principles and practices.',
            'status' => 'active',
            'number_of_years' => 5
        ]);
    }
}
