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
        $bsitCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 1)->first();
        $bsaCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 2)->first();
        $bsaCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 2)->first(); // BSA 2022

        // Courses to assign (excluding manually assigned BSA 2018 and BSA 2022)
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
            ]
        ];

        $semesterAdjustments = [
            '2018' => 0,
            '2022' => 8 // Adjust year level id for 2022 curriculum
        ];

        // Dynamic assignment for BSIT 2018
        foreach ($courseCodes['BSIT']['2018'] as $yearLevelId => $courseCodesPerSemester) {
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
                        'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id,
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

        // Dynamic assignment for BSIT 2022 with unique course IDs but keeping course_code and course_title unchanged
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

                // Retrieve the original course to duplicate the course_code and course_title
                $originalCourse = Course::where('course_code', $courseCode)->first();

                if ($originalCourse) {
                    // Create a new course for 2022 to ensure a unique course_id, but keep course_code and course_title the same
                    $newCourse = Course::create([
                        'course_code' => $originalCourse->course_code,
                        'course_title' => $originalCourse->course_title,
                        'lec_hours' => $originalCourse->lec_hours,
                        'lab_hours' => $originalCourse->lab_hours,
                        'units' => $originalCourse->units,
                        'tuition_hours' => $originalCourse->tuition_hours,
                    ]);

                    if ($newCourse) {
                        CourseAssignment::firstOrCreate([
                            'curricula_program_id' => $bsitCurriculaProgram2022->curricula_program_id,
                            'semester_id' => $semesterRecord->semester_id,
                            'course_id' => $newCourse->course_id
                        ]);
                    } else {
                        Log::error('Course creation failed for BSIT 2022', [
                            'course_code' => $courseCode
                        ]);
                    }
                }
            }
        }

        // Hardcoded manual assignment for BSA 2018 on semester_id = 13 and year_level_id = 5
        $bsa2018Courses = ['ACC101', 'ACC102', 'ACC103'];

        foreach ($bsa2018Courses as $courseCode) {
            $course = Course::where('course_code', $courseCode)->first();

            if ($course) {
                CourseAssignment::firstOrCreate([
                    'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id,
                    'semester_id' => 13,
                    'course_id' => $course->course_id,
                ]);
            } else {
                Log::error('Course not found for BSA 2018', [
                    'course_code' => $courseCode
                ]);
            }
        }

        // Manual unique assignment for BSA 2022
        $bsa2022Courses = [
            'ACC301', // Example course for BSA 2022
        ];

        foreach ($bsa2022Courses as $courseCode) {
            // Ensure unique course_id for BSA 2022 by creating a new course, but keep course_code and course_title the same
            $originalCourse = Course::where('course_code', $courseCode)->first();

            if ($originalCourse) {
                $newCourse = Course::create([
                    'course_code' => $originalCourse->course_code,
                    'course_title' => $originalCourse->course_title,
                    'lec_hours' => $originalCourse->lec_hours,
                    'lab_hours' => $originalCourse->lab_hours,
                    'units' => $originalCourse->units,
                    'tuition_hours' => $originalCourse->tuition_hours,
                ]);

                if ($newCourse) {
                    CourseAssignment::firstOrCreate([
                        'curricula_program_id' => $bsaCurriculaProgram2022->curricula_program_id,
                        'semester_id' => 14, // Assuming year 1, semester 1 for this example
                        'course_id' => $newCourse->course_id,
                    ]);
                } else {
                    Log::error('Course creation failed for BSA 2022', [
                        'course_code' => $courseCode
                    ]);
                }
            }
        }
    }
}
