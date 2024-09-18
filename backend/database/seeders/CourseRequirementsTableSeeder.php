<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseRequirementsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('course_requirements')->insert([
            [
                'requirement_id' => 1,
                'course_id' => 2,
                'requirement_type' => 'pre',
                'required_course_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 2,
                'course_id' => 5,
                'requirement_type' => 'pre',
                'required_course_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 3,
                'course_id' => 8,
                'requirement_type' => 'pre',
                'required_course_id' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 4,
                'course_id' => 11,
                'requirement_type' => 'co',
                'required_course_id' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 5,
                'course_id' => 14,
                'requirement_type' => 'pre',
                'required_course_id' => 13,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 6,
                'course_id' => 17,
                'requirement_type' => 'pre',
                'required_course_id' => 16,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 7,
                'course_id' => 20,
                'requirement_type' => 'pre',
                'required_course_id' => 19,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 8,
                'course_id' => 23,
                'requirement_type' => 'pre',
                'required_course_id' => 22,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 9,
                'course_id' => 26,
                'requirement_type' => 'pre',
                'required_course_id' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 10,
                'course_id' => 29,
                'requirement_type' => 'co',
                'required_course_id' => 28,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 11,
                'course_id' => 32,
                'requirement_type' => 'pre',
                'required_course_id' => 31,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'requirement_id' => 12,
                'course_id' => 35,
                'requirement_type' => 'pre',
                'required_course_id' => 34,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
