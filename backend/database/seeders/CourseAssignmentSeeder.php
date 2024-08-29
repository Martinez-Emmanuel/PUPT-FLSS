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

        $courses = [
            'BSIT' => [
                '2018' => [
                    1 => [
                        1 => ['course_code' => 'IT101', 'course_title' => 'Introduction to Information Technology'],
                        2 => ['course_code' => 'CS101', 'course_title' => 'Programming 1'],
                        3 => ['course_code' => 'GE101', 'course_title' => 'Mathematics in the Modern World']
                    ],
                    2 => [
                        1 => ['course_code' => 'IT201', 'course_title' => 'Data Structures'],
                        2 => ['course_code' => 'CS201', 'course_title' => 'Object-Oriented Programming'],
                        3 => ['course_code' => 'GE201', 'course_title' => 'Science, Technology, and Society']
                    ]
                ],
                '2022' => [
                    1 => [
                        1 => ['course_code' => 'IT102', 'course_title' => 'Introduction to Software Engineering'],
                        2 => ['course_code' => 'CS102', 'course_title' => 'Introduction to Web Development'],
                        3 => ['course_code' => 'GE102', 'course_title' => 'Understanding the Self']
                    ],
                    2 => [
                        1 => ['course_code' => 'IT202', 'course_title' => 'Computer Networks'],
                        2 => ['course_code' => 'CS202', 'course_title' => 'Database Systems'],
                        3 => ['course_code' => 'GE202', 'course_title' => 'Ethics']
                    ]
                ]
            ],
            'BSA' => [
                '2018' => [
                    1 => [
                        1 => ['course_code' => 'ACC101', 'course_title' => 'Introduction to Accounting'],
                        2 => ['course_code' => 'ACC102', 'course_title' => 'Intermediate Accounting'],
                        3 => ['course_code' => 'GE103', 'course_title' => 'Business Math']
                    ],
                    2 => [
                        1 => ['course_code' => 'ACC201', 'course_title' => 'Financial Accounting'],
                        2 => ['course_code' => 'ACC202', 'course_title' => 'Cost Accounting'],
                        3 => ['course_code' => 'GE203', 'course_title' => 'Business Law']
                    ]
                ],
                '2022' => [
                    1 => [
                        1 => ['course_code' => 'ACC103', 'course_title' => 'Fundamentals of Auditing'],
                        2 => ['course_code' => 'ACC104', 'course_title' => 'Taxation'],
                        3 => ['course_code' => 'GE104', 'course_title' => 'Corporate Governance']
                    ],
                    2 => [
                        1 => ['course_code' => 'ACC203', 'course_title' => 'Advanced Financial Accounting'],
                        2 => ['course_code' => 'ACC204', 'course_title' => 'Managerial Accounting'],
                        3 => ['course_code' => 'GE204', 'course_title' => 'Strategic Management']
                    ]
                ]
            ]
        ];

        foreach (['BSIT' => $bsitCurriculaProgram2018, 'BSA' => $bsaCurriculaProgram2018] as $program => $curriculaProgram) {
            $curriculumYear = $curriculaProgram->curriculum_id == 1 ? '2018' : '2022';

            foreach ($courses[$program][$curriculumYear] as $yearLevelId => $semesters) {
                foreach ($semesters as $semester => $courseDetails) {
                    $semesterId = Semester::where('year_level_id', $yearLevelId)->where('semester', $semester)->first()->semester_id;

                    $course = Course::create([
                        'course_code' => $courseDetails['course_code'],
                        'course_title' => $courseDetails['course_title'],
                        'lec_hours' => 3,
                        'lab_hours' => 2,
                        'units' => 4,
                        'tuition_hours' => 3,
                    ]);

                    CourseAssignment::create([
                        'curricula_program_id' => $curriculaProgram->curricula_program_id,
                        'semester_id' => $semesterId,
                        'course_id' => $course->course_id
                    ]);
                }
            }
        }

        foreach (['BSIT' => $bsitCurriculaProgram2022, 'BSA' => $bsaCurriculaProgram2022] as $program => $curriculaProgram) {
            $curriculumYear = $curriculaProgram->curriculum_id == 1 ? '2018' : '2022';

            foreach ($courses[$program][$curriculumYear] as $yearLevelId => $semesters) {
                foreach ($semesters as $semester => $courseDetails) {
                    $semesterId = Semester::where('year_level_id', $yearLevelId + 4)->where('semester', $semester)->first()->semester_id;

                    $course = Course::create([
                        'course_code' => $courseDetails['course_code'],
                        'course_title' => $courseDetails['course_title'],
                        'lec_hours' => 3,
                        'lab_hours' => 2,
                        'units' => 4,
                        'tuition_hours' => 3,
                    ]);

                    CourseAssignment::create([
                        'curricula_program_id' => $curriculaProgram->curricula_program_id,
                        'semester_id' => $semesterId,
                        'course_id' => $course->course_id
                    ]);
                }
            }
        }
    }
}
