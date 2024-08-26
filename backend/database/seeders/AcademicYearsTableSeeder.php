<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicYearsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('academic_years')->insert([
            [
                'academic_year_id' => 1,
                'year_start' => 2022,
                'year_end' => 2023,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_id' => 2,
                'year_start' => 2021,
                'year_end' => 2022,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_id' => 3,
                'year_start' => 2020,
                'year_end' => 2021,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_year_id' => 4,
                'year_start' => 2018,
                'year_end' => 2019,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
