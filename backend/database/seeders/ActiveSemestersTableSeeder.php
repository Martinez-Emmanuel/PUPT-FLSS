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
                'start_date' => '2024-09-09',
                'end_date' => '2025-02-07',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 2,
                'academic_year_id' => 2,
                'semester_id' => 2,
                'is_active' => 0,
                'start_date' => '2025-03-24',
                'end_date' => '2025-07-25',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 3,
                'academic_year_id' => 2,
                'semester_id' => 3,
                'is_active' => 0,
                'start_date' => '2025-08-04',
                'end_date' => '2025-09-05',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 4,
                'academic_year_id' => 1,
                'semester_id' => 1,
                'is_active' => 0,
                'start_date' => '2023-09-01',
                'end_date' => '2024-02-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 5,
                'academic_year_id' => 1,
                'semester_id' => 2,
                'is_active' => 0,
                'start_date' => '2024-03-15',
                'end_date' => '2024-07-10',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'active_semester_id' => 6,
                'academic_year_id' => 1,
                'semester_id' => 3,
                'is_active' => 0,
                'start_date' => '2024-08-01',
                'end_date' => '2024-09-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
