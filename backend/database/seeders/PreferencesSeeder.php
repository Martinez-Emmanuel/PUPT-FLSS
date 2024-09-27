<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferencesSeeder extends Seeder
{
    public function run()
    {
        $preferences = [
            // Emmanuel Martinez
            [
                'faculty_id' => 1,
                'active_semester_id' => 1,
                'course_assignment_id' => 1,
                'preferred_day' => 'Monday',
                'preferred_start_time' => '09:00:00',
                'preferred_end_time' => '10:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 1,
                'active_semester_id' => 1,
                'course_assignment_id' => 2,
                'preferred_day' => 'Wednesday',
                'preferred_start_time' => '11:00:00',
                'preferred_end_time' => '12:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Adrianna Naoe
            [
                'faculty_id' => 2,
                'active_semester_id' => 1,
                'course_assignment_id' => 3,
                'preferred_day' => 'Tuesday',
                'preferred_start_time' => '09:00:00',
                'preferred_end_time' => '10:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 2,
                'active_semester_id' => 1,
                'course_assignment_id' => 4,
                'preferred_day' => 'Thursday',
                'preferred_start_time' => '11:00:00',
                'preferred_end_time' => '12:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Kyla Malaluan
            [
                'faculty_id' => 3,
                'active_semester_id' => 1,
                'course_assignment_id' => 5,
                'preferred_day' => 'Friday',
                'preferred_start_time' => '14:00:00',
                'preferred_end_time' => '15:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 3,
                'active_semester_id' => 1,
                'course_assignment_id' => 6,
                'preferred_day' => 'Monday',
                'preferred_start_time' => '11:00:00',
                'preferred_end_time' => '12:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Via Rasquero
            [
                'faculty_id' => 4,
                'active_semester_id' => 1,
                'course_assignment_id' => 7,
                'preferred_day' => 'Wednesday',
                'preferred_start_time' => '09:00:00',
                'preferred_end_time' => '10:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 4,
                'active_semester_id' => 1,
                'course_assignment_id' => 8,
                'preferred_day' => 'Friday',
                'preferred_start_time' => '11:00:00',
                'preferred_end_time' => '12:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Additional entries for more faculty members
            [
                'faculty_id' => 1,
                'active_semester_id' => 1,
                'course_assignment_id' => 9,
                'preferred_day' => 'Thursday',
                'preferred_start_time' => '14:00:00',
                'preferred_end_time' => '15:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 2,
                'active_semester_id' => 1,
                'course_assignment_id' => 10,
                'preferred_day' => 'Saturday',
                'preferred_start_time' => '09:00:00',
                'preferred_end_time' => '10:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 3,
                'active_semester_id' => 1,
                'course_assignment_id' => 11,
                'preferred_day' => 'Tuesday',
                'preferred_start_time' => '14:00:00',
                'preferred_end_time' => '15:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 4,
                'active_semester_id' => 1,
                'course_assignment_id' => 12,
                'preferred_day' => 'Monday',
                'preferred_start_time' => '09:00:00',
                'preferred_end_time' => '10:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'faculty_id' => 1,
                'active_semester_id' => 1,
                'course_assignment_id' => 13,
                'preferred_day' => 'Sunday',
                'preferred_start_time' => '14:00:00',
                'preferred_end_time' => '15:30:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('preferences')->insert($preferences);
    }
}
