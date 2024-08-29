<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Course;
use App\Models\CourseRequirement;

class CoursesTableSeeder extends Seeder
{
    public function run()
    {
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

        $course5 = Course::create([
            'course_code' => 'IT102',
            'course_title' => 'Advanced Information Technology',
            'lec_hours' => 3,
            'lab_hours' => 1,
            'units' => 4,
            'tuition_hours' => 4
        ]);

        $course6 = Course::create([
            'course_code' => 'CS102',
            'course_title' => 'Programming 2',
            'lec_hours' => 2,
            'lab_hours' => 3,
            'units' => 3,
            'tuition_hours' => 5
        ]);

        $course7 = Course::create([
            'course_code' => 'ACC102',
            'course_title' => 'Intermediate Accounting',
            'lec_hours' => 3,
            'lab_hours' => 0,
            'units' => 3,
            'tuition_hours' => 3
        ]);

        $course8 = Course::create([
            'course_code' => 'GE102',
            'course_title' => 'Calculus in the Modern World',
            'lec_hours' => 3,
            'lab_hours' => 1,
            'units' => 4,
            'tuition_hours' => 4
        ]);

        // Add Prerequisites and Corequisites
        CourseRequirement::create([
            'course_id' => $course2->course_id,
            'requirement_type' => 'pre',
            'required_course_id' => $course1->course_id
        ]);

        CourseRequirement::create([
            'course_id' => $course6->course_id,
            'requirement_type' => 'pre',
            'required_course_id' => $course2->course_id
        ]);

        CourseRequirement::create([
            'course_id' => $course7->course_id,
            'requirement_type' => 'pre',
            'required_course_id' => $course3->course_id
        ]);

        CourseRequirement::create([
            'course_id' => $course8->course_id,
            'requirement_type' => 'pre',
            'required_course_id' => $course4->course_id
        ]);

        CourseRequirement::create([
            'course_id' => $course5->course_id,
            'requirement_type' => 'co',
            'required_course_id' => $course7->course_id
        ]);

        CourseRequirement::create([
            'course_id' => $course8->course_id,
            'requirement_type' => 'co',
            'required_course_id' => $course6->course_id
        ]);
    }
}
