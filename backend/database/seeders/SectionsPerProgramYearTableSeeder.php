<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectionsPerProgramYearTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('sections_per_program_year')->insert([
            [
                'sections_per_program_year_id' => 1,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 1,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 2,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 1,
                'section_name' => '2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 3,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 2,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 4,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 3,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 5,
                'academic_year_id' => 2,
                'program_id' => 1,
                'year_level' => 4,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 6,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 1,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 7,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 1,
                'section_name' => '2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 8,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 2,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 9,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 3,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sections_per_program_year_id' => 10,
                'academic_year_id' => 2,
                'program_id' => 2,
                'year_level' => 4,
                'section_name' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
