<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActiveSemestersTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('active_semesters')->insert([
            [
                'active_semester_id' => 1,
                'academic_year_id' => 2,
                'semester_id' => 1,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 2,
                'academic_year_id' => 2,
                'semester_id' => 2,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 3,
                'academic_year_id' => 2,
                'semester_id' => 3,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 4,
                'academic_year_id' => 1,
                'semester_id' => 1,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 5,
                'academic_year_id' => 1,
                'semester_id' => 2,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 6,
                'academic_year_id' => 1,
                'semester_id' => 3,
                'is_active' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
