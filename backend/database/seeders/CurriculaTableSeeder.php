<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CurriculaTableSeeder extends Seeder
{
    public function run()
    {{
        $currentTimestamp = Carbon::now();

// Inserting data into curricula
        DB::table('curricula')->insert([
            [
                'curriculum_id' => 1,
                'curriculum_year' => 2018,
                'status' => 'active',
                'created_at' => '2024-08-20 07:51:08',
                'updated_at' => '2024-08-20 07:51:08',
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'curriculum_id' => 2,
                'curriculum_year' => 2022,
                'status' => 'active',
                'created_at' => '2024-08-20 07:51:08',
                'updated_at' => '2024-08-20 07:51:08',
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ]);

        
    }}
}
