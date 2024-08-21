<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class YearLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {{
        $currentTimestamp = Carbon::now();

// Inserting data into year_levels
        DB::table('year_levels')->insert([
            [
                'year_level_id' => 1,
                'program_id' => 1,
                'year' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 2,
                'program_id' => 1,
                'year' => 2,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 3,
                'program_id' => 1,
                'year' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 4,
                'program_id' => 1,
                'year' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 5,
                'program_id' => 2,
                'year' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 6,
                'program_id' => 2,
                'year' => 2,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 7,
                'program_id' => 2,
                'year' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 8,
                'program_id' => 2,
                'year' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 9,
                'program_id' => 3,
                'year' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 10,
                'program_id' => 3,
                'year' => 2,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 11,
                'program_id' => 3,
                'year' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 12,
                'program_id' => 3,
                'year' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 13,
                'program_id' => 4,
                'year' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 14,
                'program_id' => 4,
                'year' => 2,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 15,
                'program_id' => 4,
                'year' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'year_level_id' => 16,
                'program_id' => 4,
                'year' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ]);

    }


}
}