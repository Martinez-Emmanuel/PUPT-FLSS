<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProgramsTableSeeder extends Seeder
{
    public function run()
    {{
        $currentTimestamp = Carbon::now();


        DB::table('programs')->insert([
            [
                'program_id' => 1,
                'program_code' => 'BSIT',
                'program_title' => 'Bachelor of Science in Information Technology',
                'program_info' => 'Focuses on IT and software development.',
                'status' => 'active',
                'number_of_years' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'program_id' => 2,
                'program_code' => 'BSA',
                'program_title' => 'Bachelor of Science in Accountancy',
                'program_info' => 'Focuses on accounting principles and practices.',
                'status' => 'active',
                'number_of_years' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ]);

        
    }}
}
