<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CourseReqTableSeeder extends Seeder
{
    public function run()
    {
        $currentTimestamp = Carbon::now();

        DB::table('course_requirements')->insert([
            [
                'requirement_id' => 1,
                'course_id' => 3,
                'requirement_type' => 'pre',
                'required_course_id' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'requirement_id' => 2,
                'course_id' => 11,
                'requirement_type' => 'pre',
                'required_course_id' => 6,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'requirement_id' => 3,
                'course_id' => 16,
                'requirement_type' => 'co',
                'required_course_id' => 7,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'requirement_id' => 4,
                'course_id' => 20,
                'requirement_type' => 'pre',
                'required_course_id' => 8,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'requirement_id' => 5,
                'course_id' => 30,
                'requirement_type' => 'pre',
                'required_course_id' => 13,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'requirement_id' => 6,
                'course_id' => 30,
                'requirement_type' => 'pre',
                'required_course_id' => 26,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ]);
    }
}
