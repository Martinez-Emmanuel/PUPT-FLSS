<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseAssignment;
use App\Models\Course;
use App\Models\Semester;
use App\Models\CurriculaProgram;
use Illuminate\Support\Facades\Log;

class CourseAssignmentSeeder extends Seeder
{
    public function run()
    {
        // Existing curricula programs
        $bsitCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 1)->first();
        $bsaCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 2)->first();
        $bsitCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 1)->first();

        // Courses to assign (excluding BSA 2022)
        $courseCodes = [
            'BSIT' => [
                '2018' => [
                    1 => ['IT101', 'CS101', 'GE101'],
                    2 => ['IT102', 'CS102', 'GE102']
                ],
                '2022' => [
                    1 => ['IT101', 'CS101', 'GE101'],
                    2 => ['IT102', 'CS102', 'GE102']
                ]
            ],
            'BSA' => [
                '2018' => [
                    1 => ['ACC101', 'ACC102', 'GE101'],
                    2 => ['ACC102', 'ACC103', 'GE102']
                ]
            ]
        ];

        $semesterAdjustments = [
            '2018' => 0,
            '2022' => 8 // Adjust year level id for 2022 curriculum
        ];

        // Dynamic assignment for BSIT and BSA 2018
        foreach (['BSIT' => $bsitCurriculaProgram2018, 'BSA' => $bsaCurriculaProgram2018] as $program => $curriculaProgram) {
            foreach ($courseCodes[$program]['2018'] as $yearLevelId => $courseCodesPerSemester) {
                foreach ($courseCodesPerSemester as $index => $courseCode) {
                    $semester = $index + 1;
                    $semesterRecord = Semester::where('year_level_id', $yearLevelId)
                        ->where('semester', $semester)
                        ->first();

                    if (!$semesterRecord) {
                        Log::error('Semester not found for 2018', [
                            'year_level_id' => $yearLevelId,
                            'semester' => $semester
                        ]);
                        continue;
                    }

                    $course = Course::where('course_code', $courseCode)->first();

                    if ($course) {
                        CourseAssignment::firstOrCreate([
                            'curricula_program_id' => $curriculaProgram->curricula_program_id,
                            'semester_id' => $semesterRecord->semester_id,
                            'course_id' => $course->course_id
                        ]);
                    } else {
                        Log::error('Course not found', [
                            'course_code' => $courseCode
                        ]);
                    }
                }
            }
        }

        // Dynamic assignment for BSIT 2022
        foreach ($courseCodes['BSIT']['2022'] as $yearLevelId => $courseCodesPerSemester) {
            $adjustedYearLevelId = $yearLevelId + $semesterAdjustments['2022'];

            foreach ($courseCodesPerSemester as $index => $courseCode) {
                $semester = $index + 1;
                $semesterRecord = Semester::where('year_level_id', $adjustedYearLevelId)
                    ->where('semester', $semester)
                    ->first();

                if (!$semesterRecord) {
                    Log::error('Semester not found for 2022', [
                        'year_level_id' => $adjustedYearLevelId,
                        'semester' => $semester
                    ]);
                    continue;
                }

                $course = Course::where('course_code', $courseCode)->first();

                if ($course) {
                    CourseAssignment::firstOrCreate([
                        'curricula_program_id' => $bsitCurriculaProgram2022->curricula_program_id,
                        'semester_id' => $semesterRecord->semester_id,
                        'course_id' => $course->course_id
                    ]);
                } else {
                    Log::error('Course not found', [
                        'course_code' => $courseCode
                    ]);
                }
            }
        }

        // Hardcoded assignment for BSA 2022 (curricula_program_id = 4)
        $bsaCurriculaProgram2022 = CurriculaProgram::where('curricula_program_id', 4)->first();

        $bsaCourses = [
            13 => [ // Year 1
                33 => ['ACC101', 'ACC102', 'GE101'], // Semester 1
                34 => ['ACC102', 'ACC103', 'GE102'], // Semester 2
            ],
            14 => [ // Year 2
                35 => ['ACC201', 'ACC202', 'GE201'], // Semester 1
                36 => ['ACC202', 'ACC203', 'GE202'], // Semester 2
            ],
        ];

        foreach ($bsaCourses as $yearLevelId => $semesters) {
            foreach ($semesters as $semesterId => $courseCodes) {
                foreach ($courseCodes as $courseCode) {
                    $course = Course::where('course_code', $courseCode)->first();

                    if ($course) {
                        CourseAssignment::firstOrCreate([
                            'curricula_program_id' => $bsaCurriculaProgram2022->curricula_program_id,
                            'semester_id' => $semesterId,
                            'course_id' => $course->course_id,
                        ]);
                    } else {
                        Log::error('Course not found', [
                            'course_code' => $courseCode
                        ]);
                    }
                }
            }
        }
    }
}
