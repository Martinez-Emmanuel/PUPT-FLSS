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
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'active_semesters.active_semester_id',
                'active_semesters.semester_id',
                'academic_years.academic_year_id',
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Step 2: Get all faculty schedules with course and program details for the active semester
        $facultySchedules = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->leftJoin('schedules', 'schedules.faculty_id', '=', 'faculty.id')
            ->leftJoin('section_courses', 'section_courses.section_course_id', '=', 'schedules.section_course_id')
            ->leftJoin('sections_per_program_year', function ($join) use ($activeSemester) {
                $join->on('sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
                     ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id);
            })
            ->leftJoin('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->leftJoin('course_assignments', function ($join) use ($activeSemester) {
                $join->on('course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
                     ->join('semesters', 'semesters.semester_id', '=', 'course_assignments.semester_id')
                     ->where('semesters.semester', '=', $activeSemester->semester);
            })
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('rooms', 'rooms.room_id', '=', 'schedules.room_id')
            ->leftJoin('faculty_schedule_publication', function ($join) {
                $join->on('faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
                     ->on('faculty_schedule_publication.faculty_id', '=', 'faculty.id');
            })
            ->where(function ($query) use ($activeSemester) {
                $query->whereNull('schedules.schedule_id')
                      ->orWhere('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id);
            })
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
                'programs.program_code',
                'programs.program_title',
                'sections_per_program_year.year_level',
                'sections_per_program_year.section_name',
                DB::raw('IFNULL(faculty_schedule_publication.is_published, 0) as is_published') 
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
                    'is_published' => 0,
                    'schedules' => []
                ];
            }

            if ($schedule->course_assignment_id) {
                $faculties[$schedule->faculty_id]['assigned_units'] += $schedule->units;
                $faculties[$schedule->faculty_id]['is_published'] = $schedule->is_published;
                $faculties[$schedule->faculty_id]['schedules'][] = [
                    'schedule_id' => $schedule->schedule_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'room_code' => $schedule->room_code,
                    'program_code' => $schedule->program_code,
                    'program_title' => $schedule->program_title,
                    'year_level' => $schedule->year_level,
                    'section_name' => $schedule->section_name,
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
                'semester' => $activeSemester->semester,
                'faculties' => array_values($faculties)
            ]
        ]);
    }
}
