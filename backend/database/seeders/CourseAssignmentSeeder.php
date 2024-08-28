<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseAssignment;
use App\Models\Course;
use App\Models\Semester;
use App\Models\CurriculaProgram;

class CourseAssignmentSeeder extends Seeder
{
    public function run()
    {
        $bsitCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 1)->first();
        $bsaCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 2)->first();
        $bsitCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 1)->first();
        $bsaCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 2)->first();

        $semester1BSIT2018 = Semester::where('year_level_id', 1)->first();
        $semester1BSA2018 = Semester::where('year_level_id', 2)->first();
        $semester1BSIT2022 = Semester::where('year_level_id', 3)->first();
        $semester1BSA2022 = Semester::where('year_level_id', 4)->first();

        // Assign Courses to Semesters for BSIT 2018 Curriculum
        CourseAssignment::create([
            'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSIT2018->semester_id,
            'course_id' => Course::where('course_code', 'IT101')->first()->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSIT2018->semester_id,
            'course_id' => Course::where('course_code', 'CS101')->first()->course_id
        ]);

        // Assign Courses to Semesters for BSA 2018 Curriculum
        CourseAssignment::create([
            'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSA2018->semester_id,
            'course_id' => Course::where('course_code', 'ACC101')->first()->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id,
            'semester_id' => $semester1BSA2018->semester_id,
            'course_id' => Course::where('course_code', 'GE101')->first()->course_id
        ]);

        // Assign Courses to Semesters for BSIT 2022 Curriculum
        CourseAssignment::create([
            'curricula_program_id' => $bsitCurriculaProgram2022->curricula_program_id,
            'semester_id' => $semester1BSIT2022->semester_id,
            'course_id' => Course::where('course_code', 'IT102')->first()->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsitCurriculaProgram2022->curricula_program_id,
            'semester_id' => $semester1BSIT2022->semester_id,
            'course_id' => Course::where('course_code', 'CS102')->first()->course_id
        ]);

        // Assign Courses to Semesters for BSA 2022 Curriculum
        CourseAssignment::create([
            'curricula_program_id' => $bsaCurriculaProgram2022->curricula_program_id,
            'semester_id' => $semester1BSA2022->semester_id,
            'course_id' => Course::where('course_code', 'ACC102')->first()->course_id
        ]);

        CourseAssignment::create([
            'curricula_program_id' => $bsaCurriculaProgram2022->curricula_program_id,
            'semester_id' => $semester1BSA2022->semester_id,
            'course_id' => Course::where('course_code', 'GE102')->first()->course_id
        ]);
    }
}
