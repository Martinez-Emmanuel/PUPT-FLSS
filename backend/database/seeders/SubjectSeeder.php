<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $currentTimestamp = Carbon::now();

        $subjects = [
            [
                'course_code' => 'ACCO 20063',
                'course_title' => 'Conceptual Frameworks and Accounting Standards',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'BUMA 20063',
                'course_title' => 'Principles of Management and Organization',
                'lec_hours' => 2,
                'lab_hours' => 2,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'COMP 20163',
                'course_title' => 'Web Development',
                'lec_hours' => 3,
                'lab_hours' => 0,
                'units' => 3,
                'tuition_hours' => 3, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'ECEN 30024',
                'course_title' => 'Advanced Engineering Mathematics for ECE',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'EDUC 30013',
                'course_title' => 'The Child and Adolescent Learner and Learning Principles',
                'lec_hours' => 2,
                'lab_hours' => 2,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'COMP20138',
                'course_title' => 'Artificial Intelligence',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'ENSC 20033',
                'course_title' => 'Engineering Management',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'GEED 10053',
                'course_title' => 'Mathematics in the Modern World',
                'lec_hours' => 2,
                'lab_hours' => 2,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'COMP20141',
                'course_title' => 'Strategic Business Analysis with Contemporary Issues and Trends',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_code' => 'HRMA 30013',
                'course_title' => 'Administrative and Office Management',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'units' => 4,
                'tuition_hours' => 4, 
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ];

        DB::table('courses')->insert($subjects);
    }
}
