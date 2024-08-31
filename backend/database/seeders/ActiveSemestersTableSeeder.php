<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActiveSemester;
use App\Models\Semester;

class ActiveSemestersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch the relevant Semester IDs
        $semester1 = Semester::where('semester_id', 1)->first();
        $semester2 = Semester::where('semester_id', 2)->first();
        $semester4 = Semester::where('semester_id', 4)->first();
        $semester5 = Semester::where('semester_id', 5)->first();

        // Create Active Semesters using the fetched semester IDs
        ActiveSemester::create([
            'academic_year_id' => 1,
            'semester_id' => $semester1->semester_id,
            'is_active' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ActiveSemester::create([
            'academic_year_id' => 1,
            'semester_id' => $semester2->semester_id,
            'is_active' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ActiveSemester::create([
            'academic_year_id' => 3,
            'semester_id' => $semester4->semester_id,
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ActiveSemester::create([
            'academic_year_id' => 2,
            'semester_id' => $semester5->semester_id,
            'is_active' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
