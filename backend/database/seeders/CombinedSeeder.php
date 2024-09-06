<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicYear;
use App\Models\ActiveSemester;
use App\Models\Semester;
use App\Models\YearLevel;
use App\Models\CurriculaProgram;

class CombinedSeeder extends Seeder
{
    public function run()
    {
        // Step 1: Seed Academic Years
        $academicYears = [
            ['academic_year_id' => 1, 'year_start' => 2022, 'year_end' => 2023, 'is_active' => 1],
            ['academic_year_id' => 2, 'year_start' => 2021, 'year_end' => 2022, 'is_active' => 0],
            ['academic_year_id' => 3, 'year_start' => 2020, 'year_end' => 2021, 'is_active' => 0],
            ['academic_year_id' => 4, 'year_start' => 2018, 'year_end' => 2019, 'is_active' => 0],
        ];

        foreach ($academicYears as $academicYear) {
            AcademicYear::create(array_merge($academicYear, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Step 2: Seed Year Levels
        $curriculaPrograms = [
            ['curriculum_id' => 1, 'program_id' => 1, 'label' => 'BSIT 2018'],
            ['curriculum_id' => 1, 'program_id' => 2, 'label' => 'BSA 2018'],
            ['curriculum_id' => 2, 'program_id' => 1, 'label' => 'BSIT 2022'],
            ['curriculum_id' => 2, 'program_id' => 2, 'label' => 'BSA 2022'],
        ];

        foreach ($curriculaPrograms as $curriculaProgram) {
            $program = CurriculaProgram::where('curriculum_id', $curriculaProgram['curriculum_id'])
                ->where('program_id', $curriculaProgram['program_id'])
                ->first();

            for ($year = 1; $year <= 4; $year++) {
                YearLevel::create([
                    'year' => $year,
                    'curricula_program_id' => $program->curricula_program_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Step 3: Seed Semesters
        foreach ($curriculaPrograms as $curriculaProgram) {
            $program = CurriculaProgram::where('curriculum_id', $curriculaProgram['curriculum_id'])
                ->where('program_id', $curriculaProgram['program_id'])
                ->first();

            $yearLevels = YearLevel::where('curricula_program_id', $program->curricula_program_id)->get();

            foreach ($yearLevels as $yearLevel) {
                $semestersCount = ($curriculaProgram['label'] === 'BSIT 2022' || $curriculaProgram['label'] === 'BSA 2022') ? 2 : 3;
                for ($semester = 1; $semester <= $semestersCount; $semester++) {
                    Semester::create([
                        'year_level_id' => $yearLevel->year_level_id,
                        'semester' => $semester,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Step 4: Seed Active Semesters
        $activeSemestersData = [
            ['academic_year_id' => 1, 'semester_id' => 1, 'is_active' => 0],
            ['academic_year_id' => 1, 'semester_id' => 2, 'is_active' => 0],
            ['academic_year_id' => 3, 'semester_id' => 4, 'is_active' => 1],
            ['academic_year_id' => 2, 'semester_id' => 5, 'is_active' => 0],
        ];

        foreach ($activeSemestersData as $data) {
            ActiveSemester::create(array_merge($data, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
