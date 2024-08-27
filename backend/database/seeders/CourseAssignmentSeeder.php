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
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 1,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 2,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 2,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 3,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 9,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 4,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 11,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 5,
                'curricula_program_id' => 1,
                'semester_id' => 2,
                'course_id' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 6,
                'curricula_program_id' => 1,
                'semester_id' => 2,
                'course_id' => 10,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 7,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 5,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 8,
                'curricula_program_id' => 1,
                'semester_id' => 4,
                'course_id' => 12,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 9,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 6,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 10,
                'curricula_program_id' => 1,
                'semester_id' => 4,
                'course_id' => 7,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 11,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 8,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 12,
                'curricula_program_id' => 1,
                'semester_id' => 4,
                'course_id' => 4,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 13,
                'curricula_program_id' => 1,
                'semester_id' => 1,
                'course_id' => 3,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 14,
                'curricula_program_id' => 1,
                'semester_id' => 2,
                'course_id' => 9,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 15,
                'curricula_program_id' => 2,
                'semester_id' => 5,
                'course_id' => 10,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 16,
                'curricula_program_id' => 2,
                'semester_id' => 5,
                'course_id' => 11,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 17,
                'curricula_program_id' => 2,
                'semester_id' => 5,
                'course_id' => 12,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 18,
                'curricula_program_id' => 2,
                'semester_id' => 6,
                'course_id' => 13,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 19,
                'curricula_program_id' => 2,
                'semester_id' => 6,
                'course_id' => 14,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 20,
                'curricula_program_id' => 2,
                'semester_id' => 6,
                'course_id' => 16,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 21,
                'curricula_program_id' => 2,
                'semester_id' => 7,
                'course_id' => 15,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 22,
                'curricula_program_id' => 2,
                'semester_id' => 8,
                'course_id' => 17,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 23,
                'curricula_program_id' => 2,
                'semester_id' => 8,
                'course_id' => 18,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
            [
                'course_assignment_id' => 24,
                'curricula_program_id' => 2,
                'semester_id' => 10,
                'course_id' => 19,
                'created_at' => $currentTimestamp,
                'updated_at' => $currentTimestamp,
            ],
        ]);
    }
}
