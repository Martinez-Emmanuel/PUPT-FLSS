<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class YearLevelsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('year_levels')->insert([
            [
                'year_level_id' => 1,
                'curricula_program_id' => 3,
                'year' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 2,
                'curricula_program_id' => 3,
                'year' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 3,
                'curricula_program_id' => 1,
                'year' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 4,
                'curricula_program_id' => 1,
                'year' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 5,
                'curricula_program_id' => 4,
                'year' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 6,
                'curricula_program_id' => 4,
                'year' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 7,
                'curricula_program_id' => 2,
                'year' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 8,
                'curricula_program_id' => 2,
                'year' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 9,
                'curricula_program_id' => 3,
                'year' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 10,
                'curricula_program_id' => 3,
                'year' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 11,
                'curricula_program_id' => 4,
                'year' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 12,
                'curricula_program_id' => 4,
                'year' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 17,
                'curricula_program_id' => 1,
                'year' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 18,
                'curricula_program_id' => 1,
                'year' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 19,
                'curricula_program_id' => 2,
                'year' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 20,
                'curricula_program_id' => 2,
                'year' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 21,
                'curricula_program_id' => 3,
                'year' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 22,
                'curricula_program_id' => 3,
                'year' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 23,
                'curricula_program_id' => 4,
                'year' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'year_level_id' => 24,
                'curricula_program_id' => 4,
                'year' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
