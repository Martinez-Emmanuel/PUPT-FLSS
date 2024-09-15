<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SectionsPerProgramYear;
use App\Models\SectionCourse;

class SectionsPerProgramYearSeeder extends Seeder
{
    public function run()
    {
        // Step 1: Seed Sections Per Program Year
        $sectionsPerProgramYear = [
            ['sections_per_program_year_id' => 1, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 1, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 2, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 1, 'section_name' => 'Section 2'],
            ['sections_per_program_year_id' => 3, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 2, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 4, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 3, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 5, 'academic_year_id' => 2, 'program_id' => 1, 'year_level' => 4, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 6, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 1, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 7, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 1, 'section_name' => 'Section 1B'],
            ['sections_per_program_year_id' => 8, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 2, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 9, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 3, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 10, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 4, 'section_name' => 'Section 1'],
            ['sections_per_program_year_id' => 11, 'academic_year_id' => 2, 'program_id' => 2, 'year_level' => 2, 'section_name' => 'Section 1'],
        ];

        foreach ($sectionsPerProgramYear as $record) {
            SectionsPerProgramYear::create(array_merge($record, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Step 2: Seed Section Courses
        $sectionCourses = [
            ['section_course_id' => 1, 'sections_per_program_year_id' => 1, 'course_assignment_id' => 1],
            ['section_course_id' => 2, 'sections_per_program_year_id' => 1, 'course_assignment_id' => 2],
            ['section_course_id' => 3, 'sections_per_program_year_id' => 1, 'course_assignment_id' => 3],
            ['section_course_id' => 4, 'sections_per_program_year_id' => 2, 'course_assignment_id' => 1],
            ['section_course_id' => 5, 'sections_per_program_year_id' => 2, 'course_assignment_id' => 2],
            ['section_course_id' => 6, 'sections_per_program_year_id' => 2, 'course_assignment_id' => 3],
            ['section_course_id' => 7, 'sections_per_program_year_id' => 6, 'course_assignment_id' => 4],
            ['section_course_id' => 8, 'sections_per_program_year_id' => 6, 'course_assignment_id' => 5],
            ['section_course_id' => 9, 'sections_per_program_year_id' => 6, 'course_assignment_id' => 6],
            ['section_course_id' => 10, 'sections_per_program_year_id' => 7, 'course_assignment_id' => 4],
            ['section_course_id' => 11, 'sections_per_program_year_id' => 7, 'course_assignment_id' => 5],
            ['section_course_id' => 12, 'sections_per_program_year_id' => 7, 'course_assignment_id' => 6],
        ];

        foreach ($sectionCourses as $record) {
            SectionCourse::create(array_merge($record, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
