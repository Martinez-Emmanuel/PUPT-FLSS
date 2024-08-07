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
                'subject_code' => 'ACCO 20063',
                'subject_title' => 'Conceptual Frameworks and Accounting Standards',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'BUMA 20063',
                'subject_title' => 'Principles of Management and Organization',
                'lec_hours' => 2,
                'lab_hours' => 2,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'COMP 20163',
                'subject_title' => 'Web Development',
                'lec_hours' => 3,
                'lab_hours' => 0,
                'total_units' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'ECEN 30024',
                'subject_title' => 'Advanced Engineering Mathematics for ECE',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'EDUC 30013',
                'subject_title' => 'The Child and Adolescent Learner and Learning Principles',
                'lec_hours' => 2,
                'lab_hours' => 2,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'COMP20138',
                'subject_title' => 'Artificial Intelligence',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'ENSC 20033',
                'subject_title' => 'Engineering Management',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'GEED 10053',
                'subject_title' => 'Mathematics in the Modern World',
                'lec_hours' => 2,
                'lab_hours' => 2,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'COMP20141',
                'subject_title' => 'Strategic Business Analysis with Contemporary Issues and Trends',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'subject_code' => 'HRMA 30013',
                'subject_title' => 'Administrative and Office Management',
                'lec_hours' => 3,
                'lab_hours' => 1,
                'total_units' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ];

        DB::table('courses')->insert($subjects);
    }
}
