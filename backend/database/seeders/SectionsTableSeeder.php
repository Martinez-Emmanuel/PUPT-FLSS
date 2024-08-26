<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('sections')->insert([
            [
                'section_id' => 1,
                'section_name' => '1',
                'year_level_id' => 1,
                'academic_year_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_id' => 3,
                'section_name' => '3',
                'year_level_id' => 2,
                'academic_year_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_id' => 4,
                'section_name' => '4',
                'year_level_id' => 5,
                'academic_year_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_id' => 5,
                'section_name' => '5',
                'year_level_id' => 6,
                'academic_year_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'section_id' => 2,
                'section_name' => '2',
                'year_level_id' => 1,
                'academic_year_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
