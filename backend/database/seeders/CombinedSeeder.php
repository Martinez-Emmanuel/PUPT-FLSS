<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicYear;
use App\Models\ActiveSemester;
use App\Models\Semester;
use App\Models\YearLevel;
use App\Models\CurriculaProgram;
use App\Models\AcademicYearCurricula;
use App\Models\ProgramYearLevelCurricula;
use App\Models\Curriculum;
class CombinedSeeder extends Seeder
{
    public function run()
    {
        // Step 1: Seed Academic Years
        $academicYears = [
            ['academic_year_id' => 1, 'year_start' => 2023, 'year_end' => 2024, 'is_active' => 0],
            ['academic_year_id' => 2, 'year_start' => 2024, 'year_end' => 2025, 'is_active' => 1],
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

         // Step 3: Seed Active Semesters (based on the screenshot data)
         $activeSemesters = [
            ['active_semester_id' => 1, 'academic_year_id' => 2, 'semester_id' => 1, 'is_active' => 1],
            ['active_semester_id' => 2, 'academic_year_id' => 1, 'semester_id' => 1, 'is_active' => 0],
            ['active_semester_id' => 3, 'academic_year_id' => 1, 'semester_id' => 2, 'is_active' => 0],
            ['active_semester_id' => 4, 'academic_year_id' => 1, 'semester_id' => 3, 'is_active' => 0],
        ];

        foreach ($activeSemesters as $activeSemester) {
            ActiveSemester::create(array_merge($activeSemester, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

         // Step 5: Seed Academic Year Curricula (Based on the new screenshot)
         $academicYearCurricula = [
            ['academic_year_id' => 1, 'curriculum_id' => 1],
            ['academic_year_id' => 1, 'curriculum_id' => 2],
            ['academic_year_id' => 2, 'curriculum_id' => 1],
            ['academic_year_id' => 2, 'curriculum_id' => 2],
        ];

        foreach ($academicYearCurricula as $yearCurricula) {
            AcademicYearCurricula::create(array_merge($yearCurricula, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Data from the screenshot
        $programYearLevelCurricula = [
            ['program_year_level_curricula_id' => 1, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 1, 'curriculum_id' => 2],
            ['program_year_level_curricula_id' => 2, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 2, 'curriculum_id' => 2],
            ['program_year_level_curricula_id' => 3, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 3, 'curriculum_id' => 1],
            ['program_year_level_curricula_id' => 4, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 4, 'curriculum_id' => 1],
            ['program_year_level_curricula_id' => 5, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 1, 'curriculum_id' => 2],
            ['program_year_level_curricula_id' => 6, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 2, 'curriculum_id' => 2],
            ['program_year_level_curricula_id' => 7, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 3, 'curriculum_id' => 1],
            ['program_year_level_curricula_id' => 8, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 4, 'curriculum_id' => 1],
        ];

        foreach ($programYearLevelCurricula as $record) {
            ProgramYearLevelCurricula::create(array_merge($record, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
        
    }
}
