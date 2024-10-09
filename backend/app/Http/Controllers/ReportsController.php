<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ActiveSemester;

class ReportsController extends Controller
{
    public function getFacultySchedulesReport()
    {
        // Step 1: Retrieve the current active semester with academic year details
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'active_semesters.active_semester_id',
                'active_semesters.semester_id',
                'academic_years.academic_year_id',
                'academic_years.year_start',
                'academic_years.year_end'
            )
            ->first();
    
        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }
    
        // Step 2: Get all faculty schedules with course details, including faculty without schedules
        $facultySchedules = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->leftJoin('schedules', 'schedules.faculty_id', '=', 'faculty.id')
            ->leftJoin('section_courses', 'section_courses.section_course_id', '=', 'schedules.section_course_id')
            ->leftJoin('sections_per_program_year', function ($join) use ($activeSemester) {
                $join->on('sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
                     ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id);
            })
            ->leftJoin('course_assignments', function ($join) use ($activeSemester) {
                $join->on('course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
                     ->where('course_assignments.semester_id', '=', $activeSemester->semester_id);
            })
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('rooms', 'rooms.room_id', '=', 'schedules.room_id')
            ->select(
                'faculty.id as faculty_id',
                'users.name as faculty_name',
                'users.code as faculty_code',
                'faculty.faculty_type',
                'schedules.schedule_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'rooms.room_code',
                'course_assignments.course_assignment_id',
                'courses.course_title',
                'courses.course_code',
                'courses.lec_hours',
                'courses.lab_hours',
                'courses.units',
                'courses.tuition_hours',
                'schedules.is_published'
            )
            ->get();
    
        // Step 3: Group the data by faculty and structure schedules
        $faculties = [];
    
        foreach ($facultySchedules as $schedule) {
            if (!isset($faculties[$schedule->faculty_id])) {
                $faculties[$schedule->faculty_id] = [
                    'faculty_id' => $schedule->faculty_id,
                    'faculty_name' => $schedule->faculty_name,
                    'faculty_code' => $schedule->faculty_code,
                    'faculty_type' => $schedule->faculty_type,
                    'assigned_units' => 0,
                    'is_published' => $schedule->is_published,
                    'schedules' => []
                ];
            }
    
            if ($schedule->course_assignment_id) {
                $faculties[$schedule->faculty_id]['assigned_units'] += $schedule->units;
    
                $faculties[$schedule->faculty_id]['schedules'][] = [
                    'schedule_id' => $schedule->schedule_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'room_code' => $schedule->room_code,
                    'course_details' => [
                        'course_assignment_id' => $schedule->course_assignment_id,
                        'course_title' => $schedule->course_title,
                        'course_code' => $schedule->course_code,
                        'lec' => $schedule->lec_hours,
                        'lab' => $schedule->lab_hours,
                        'units' => $schedule->units,
                        'tuition_hours' => $schedule->tuition_hours
                    ]
                ];
            }
        }
    
        // Step 4: Structure the response
        return response()->json([
            'faculty_schedule_reports' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester_id,
                'faculties' => array_values($faculties)
            ]
        ]);
    }
}
