<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicYearsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('academic_years')->insert([
            [
                'academic_year_id' => 1,
                'year_start' => 2023,
                'year_end' => 2024,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_id' => 2,
                'year_start' => 2024,
                'year_end' => 2025,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
