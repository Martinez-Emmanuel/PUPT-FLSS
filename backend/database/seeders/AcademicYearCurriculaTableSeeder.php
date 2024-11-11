<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicYearCurriculaTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('academic_year_curricula')->insert([
            [
                'academic_year_curricula_id' => 1,
                'academic_year_id' => 1,
                'curriculum_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_curricula_id' => 2,
                'academic_year_id' => 1,
                'curriculum_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_curricula_id' => 3,
                'academic_year_id' => 2,
                'curriculum_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_curricula_id' => 4,
                'academic_year_id' => 2,
                'curriculum_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
