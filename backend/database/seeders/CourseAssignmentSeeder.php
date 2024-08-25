<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CourseAssignmentSeeder extends Seeder
{
    public function run()
    {
        $currentTimestamp = Carbon::now();

        DB::table('course_assignments')->insert([
            [
                'course_assignment_id' => 1,
                'program_id' => 1,
                'semester_id' => 1,
                'course_id' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 2,
                'program_id' => 1,
                'semester_id' => 1,
                'course_id' => 2,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 3,
                'program_id' => 1,
                'semester_id' => 1,
                'course_id' => 7,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 4,
                'program_id' => 1,
                'semester_id' => 2,
                'course_id' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 5,
                'program_id' => 1,
                'semester_id' => 2,
                'course_id' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 6,
                'program_id' => 1,
                'semester_id' => 2,
                'course_id' => 8,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 7,
                'program_id' => 1,
                'semester_id' => 3,
                'course_id' => 5,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 8,
                'program_id' => 1,
                'semester_id' => 3,
                'course_id' => 10,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 9,
                'program_id' => 1,
                'semester_id' => 4,
                'course_id' => 11,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 10,
                'program_id' => 1,
                'semester_id' => 4,
                'course_id' => 12,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 11,
                'program_id' => 1,
                'semester_id' => 4,
                'course_id' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 12,
                'program_id' => 1,
                'semester_id' => 5,
                'course_id' => 13,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 13,
                'program_id' => 1,
                'semester_id' => 5,
                'course_id' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 14,
                'program_id' => 1,
                'semester_id' => 5,
                'course_id' => 14,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 15,
                'program_id' => 1,
                'semester_id' => 6,
                'course_id' => 15,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ]);
    }
}
