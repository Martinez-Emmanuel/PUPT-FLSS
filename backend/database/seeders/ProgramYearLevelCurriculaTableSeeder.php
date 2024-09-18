<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramYearLevelCurriculaTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('program_year_level_curricula')->insert([
            [
                'program_year_level_curricula_id' => 1,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 1,
                'curriculum_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 2,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 2,
                'curriculum_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 3,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 3,
                'curriculum_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 4,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 4,
                'curriculum_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 5,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 1,
                'curriculum_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 6,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 2,
                'curriculum_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 7,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 3,
                'curriculum_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'program_year_level_curricula_id' => 8,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 4,
                'curriculum_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
