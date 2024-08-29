<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Semester;
use App\Models\YearLevel;

class SemestersTableSeeder extends Seeder
{
    public function run()
    {
        // Fetch all Year Levels
        $bsitYearLevels2018 = YearLevel::where('curricula_program_id', 1)->get();
        $bsaYearLevels2018 = YearLevel::where('curricula_program_id', 2)->get();
        $bsitYearLevels2022 = YearLevel::where('curricula_program_id', 3)->get();
        $bsaYearLevels2022 = YearLevel::where('curricula_program_id', 4)->get();

        // Create Semesters for each Year Level in BSIT 2018
        foreach ($bsitYearLevels2018 as $yearLevel) {
            for ($semester = 1; $semester <= 3; $semester++) {
                Semester::create(['year_level_id' => $yearLevel->year_level_id, 'semester' => $semester]);
            }
        }

        // Create Semesters for each Year Level in BSA 2018
        foreach ($bsaYearLevels2018 as $yearLevel) {
            for ($semester = 1; $semester <= 3; $semester++) {
                Semester::create(['year_level_id' => $yearLevel->year_level_id, 'semester' => $semester]);
            }
        }

        // Create Semesters for each Year Level in BSIT 2022
        foreach ($bsitYearLevels2022 as $yearLevel) {
            for ($semester = 1; $semester <= 2; $semester++) {
                Semester::create(['year_level_id' => $yearLevel->year_level_id, 'semester' => $semester]);
            }
        }

        // Create Semesters for each Year Level in BSA 2022
        foreach ($bsaYearLevels2022 as $yearLevel) {
            for ($semester = 1; $semester <= 2; $semester++) {
                Semester::create(['year_level_id' => $yearLevel->year_level_id, 'semester' => $semester]);
            }
        }
    }
}
