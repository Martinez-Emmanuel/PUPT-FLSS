<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Curriculum;
use App\Models\Program;
use App\Models\YearLevel;
use App\Models\Semester;
use App\Models\Course;
use App\Models\CourseRequirement;
use App\Models\CourseAssignment;
use App\Models\CurriculaProgram;

class CurriculumProgramSeeder extends Seeder
{
    public function run()
    {
        // Seed Curriculums
        $curriculum2018 = Curriculum::create(['curriculum_year' => 2018, 'status' => 'active']);
        $curriculum2022 = Curriculum::create(['curriculum_year' => 2022, 'status' => 'active']);

        // Seed Programs
        $bsitProgram = Program::create([
            'program_code' => 'BSIT',
            'program_title' => 'Bachelor of Science in Information Technology',
            'program_info' => 'Focuses on information technology and its applications.',
            'status' => 'active',
            'number_of_years' => 4
        ]);

        $bsaProgram = Program::create([
            'program_code' => 'BSA',
            'program_title' => 'Bachelor of Science in Accountancy',
            'program_info' => 'Focuses on accounting principles and practices.',
            'status' => 'active',
            'number_of_years' => 5
        ]);

        // Associate Programs with Curriculums
        $bsitCurriculaProgram2018 = CurriculaProgram::create([
            'curriculum_id' => $curriculum2018->curriculum_id,
            'program_id' => $bsitProgram->program_id
        ]);

        $bsaCurriculaProgram2018 = CurriculaProgram::create([
            'curriculum_id' => $curriculum2018->curriculum_id,
            'program_id' => $bsaProgram->program_id
        ]);

        $bsitCurriculaProgram2022 = CurriculaProgram::create([
            'curriculum_id' => $curriculum2022->curriculum_id,
            'program_id' => $bsitProgram->program_id
        ]);

        $bsaCurriculaProgram2022 = CurriculaProgram::create([
            'curriculum_id' => $curriculum2022->curriculum_id,
            'program_id' => $bsaProgram->program_id
        ]);

        // Seed Year Levels
        $yearLevel1BSIT2018 = YearLevel::create([
            'year' => 1,
            'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id
        ]);

        $yearLevel1BSA2018 = YearLevel::create([
            'year' => 1,
            'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id
        ]);

        $yearLevel1BSIT2022 = YearLevel::create([
            'year' => 1,
            'curricula_program_id' => $bsitCurriculaProgram2022->curricula_program_id
        ]);

        $yearLevel1BSA2022 = YearLevel::create([
            'year' => 1,
            'curricula_program_id' => $bsaCurriculaProgram2022->curricula_program_id
        ]);

        // Seed Semesters
        $semester1BSIT2018 = Semester::create(['year_level_id' => $yearLevel1BSIT2018->year_level_id, 'semester' => 1]);
        $semester1BSA2018 = Semester::create(['year_level_id' => $yearLevel1BSA2018->year_level_id, 'semester' => 1]);
        $semester1BSIT2022 = Semester::create(['year_level_id' => $yearLevel1BSIT2022->year_level_id, 'semester' => 1]);
        $semester1BSA2022 = Semester::create(['year_level_id' => $yearLevel1BSA2022->year_level_id, 'semester' => 1]);

        // Seed Courses with Prerequisites and Corequisites
        $course1 = Course::create([
            'course_code' => 'IT101',
            'course_title' => 'Introduction to Information Technology',
            'lec_hours' => 3,
            'lab_hours' => 0,
            'units' => 3,
            'tuition_hours' => 3
        ]);

        $course2 = Course::create([
            'course_code' => 'CS101',
            'course_title' => 'Programming 1',
            'lec_hours' => 2,
            'lab_hours' => 3,
            'units' => 3,
            'tuition_hours' => 5
        ]);

        $course3 = Course::create([
            'course_code' => 'ACC101',
            'course_title' => 'Introduction to Accounting',
            'lec_hours' => 3,
            'lab_hours' => 0,
            'units' => 3,
            'tuition_hours' => 3
        ]);

        $course4 = Course::create([
            'course_code' => 'GE101',
            'course_title' => 'Mathematics in the Modern World',
            'lec_hours' => 3,
            'lab_hours' => 0,
            'units' => 3,
            'tuition_hours' => 3
        ]);

        // Assign Courses to Semesters
        CourseAssignment::create([
            'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSIT2018->semester_id,
            'course_id' => $course1->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSIT2018->semester_id,
            'course_id' => $course2->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSA2018->semester_id,
            'course_id' => $course3->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSA2018->semester_id,
            'course_id' => $course4->course_id
        ]);

        // Add Prerequisites and Corequisites
        CourseRequirement::create([
            'course_id' => $course2->course_id,
            'requirement_type' => 'pre',
            'required_course_id' => $course1->course_id
        ]);

        CourseRequirement::create([
            'course_id' => $course4->course_id,
            'requirement_type' => 'co',
            'required_course_id' => $course3->course_id
        ]);
    }
}

