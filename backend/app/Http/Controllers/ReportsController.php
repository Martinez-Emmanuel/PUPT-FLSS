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

        // Step 2: Prepare a subquery to get schedules for the current semester and academic year
        $schedulesSub = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select(
                'schedules.schedule_id',
                'schedules.faculty_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'schedules.room_id',
                'schedules.section_course_id'
            );

        // Step 3: Join faculties with current schedules
        $facultySchedules = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->leftJoinSub($schedulesSub, 'current_schedules', function ($join) {
                $join->on('current_schedules.faculty_id', '=', 'faculty.id');
            })
            ->leftJoin('section_courses', 'current_schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->leftJoin('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->leftJoin('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->leftJoin('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('rooms', 'rooms.room_id', '=', 'current_schedules.room_id')
            ->leftJoin('faculty_schedule_publication', function ($join) {
                $join->on('faculty_schedule_publication.schedule_id', '=', 'current_schedules.schedule_id')
                     ->on('faculty_schedule_publication.faculty_id', '=', 'faculty.id');
            })
            ->select(
                'faculty.id as faculty_id',
                'users.name as faculty_name',
                'users.code as faculty_code',
                'faculty.faculty_type',
                'current_schedules.schedule_id',
                'current_schedules.day',
                'current_schedules.start_time',
                'current_schedules.end_time',
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

        // Step 4: Group the data by faculty and structure schedules
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

            if ($schedule->schedule_id) {
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

        // Step 5: Structure the response
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

    public function getRoomSchedulesReport()
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

        // Step 2: Prepare a subquery to get schedules for the current semester and academic year
        $schedulesSub = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select(
                'schedules.schedule_id',
                'schedules.room_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'schedules.faculty_id',
                'schedules.section_course_id'
            );

        // Step 3: Join rooms with current schedules
        $roomSchedules = DB::table('rooms')
            ->leftJoinSub($schedulesSub, 'current_schedules', function ($join) {
                $join->on('current_schedules.room_id', '=', 'rooms.room_id');
            })
            ->leftJoin('faculty', 'current_schedules.faculty_id', '=', 'faculty.id')
            ->leftJoin('users', 'faculty.user_id', '=', 'users.id')
            ->leftJoin('section_courses', 'current_schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->leftJoin('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->leftJoin('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->leftJoin('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->select(
                'rooms.room_id',
                'rooms.room_code',
                'rooms.location',
                'rooms.floor_level',
                'rooms.capacity',
                'current_schedules.schedule_id',
                'current_schedules.day',
                'current_schedules.start_time',
                'current_schedules.end_time',
                'users.name as faculty_name',
                'users.code as faculty_code',
                'programs.program_code',
                'programs.program_title',
                'sections_per_program_year.year_level',
                'sections_per_program_year.section_name',
                'course_assignments.course_assignment_id',
                'courses.course_title',
                'courses.course_code',
                'courses.lec_hours as lec',
                'courses.lab_hours as lab',
                'courses.units',
                'courses.tuition_hours'
            )
            ->get();

        // Step 4: Group the data by room and structure schedules
        $rooms = [];

        foreach ($roomSchedules as $schedule) {
            if (!isset($rooms[$schedule->room_id])) {
                $rooms[$schedule->room_id] = [
                    'room_id' => $schedule->room_id,
                    'room_code' => $schedule->room_code,
                    'location' => $schedule->location,
                    'floor_level' => $schedule->floor_level,
                    'capacity' => $schedule->capacity,
                    'schedules' => []
                ];
            }

            if ($schedule->schedule_id) {
                $rooms[$schedule->room_id]['schedules'][] = [
                    'schedule_id' => $schedule->schedule_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'faculty_name' => $schedule->faculty_name,
                    'faculty_code' => $schedule->faculty_code,
                    'program_code' => $schedule->program_code,
                    'program_title' => $schedule->program_title,
                    'year_level' => $schedule->year_level,
                    'section_name' => $schedule->section_name,
                    'course_details' => [
                        'course_assignment_id' => $schedule->course_assignment_id,
                        'course_title' => $schedule->course_title,
                        'course_code' => $schedule->course_code,
                        'lec' => $schedule->lec,
                        'lab' => $schedule->lab,
                        'units' => $schedule->units,
                        'tuition_hours' => $schedule->tuition_hours
                    ]
                ];
            }
        }

        // Step 5: Structure the response
        return response()->json([
            'room_schedule_reports' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester,
                'rooms' => array_values($rooms)
            ]
        ]);
    }

    public function getProgramSchedulesReport()
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

        // Step 2: Prepare a subquery to get schedules for the current semester and academic year
        $schedulesSub = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select(
                'schedules.schedule_id',
                'schedules.faculty_id',
                'schedules.room_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'sections_per_program_year.program_id',
                'sections_per_program_year.year_level',
                'sections_per_program_year.section_name',
                'course_assignments.course_assignment_id',
                'courses.course_title',
                'courses.course_code',
                'courses.lec_hours as lec',
                'courses.lab_hours as lab',
                'courses.units',
                'courses.tuition_hours'
            )
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id');

        // Step 3: Join programs with current schedules
        $programSchedules = DB::table('programs')
            ->leftJoinSub($schedulesSub, 'current_schedules', function ($join) {
                $join->on('current_schedules.program_id', '=', 'programs.program_id');
            })
            ->leftJoin('faculty', 'current_schedules.faculty_id', '=', 'faculty.id')
            ->leftJoin('users', 'faculty.user_id', '=', 'users.id')
            ->leftJoin('rooms', 'current_schedules.room_id', '=', 'rooms.room_id')
            ->select(
                'programs.program_id',
                'programs.program_code',
                'programs.program_title',
                'current_schedules.year_level',
                'current_schedules.section_name',
                'current_schedules.schedule_id',
                'current_schedules.day',
                'current_schedules.start_time',
                'current_schedules.end_time',
                'users.name as faculty_name',
                'users.code as faculty_code',
                'rooms.room_code',
                'current_schedules.course_assignment_id',
                'current_schedules.course_title',
                'current_schedules.course_code',
                'current_schedules.lec',
                'current_schedules.lab',
                'current_schedules.units',
                'current_schedules.tuition_hours'
            )
            ->get();

        // Step 4: Group the data by program, year level, and section
        $programs = [];

        foreach ($programSchedules as $schedule) {
            if (!isset($programs[$schedule->program_id])) {
                $programs[$schedule->program_id] = [
                    'program_id' => $schedule->program_id,
                    'program_code' => $schedule->program_code,
                    'program_title' => $schedule->program_title,
                    'year_levels' => []
                ];
            }

            // Initialize year_level if not set
            if (!isset($programs[$schedule->program_id]['year_levels'][$schedule->year_level])) {
                $programs[$schedule->program_id]['year_levels'][$schedule->year_level] = [
                    'year_level' => $schedule->year_level,
                    'sections' => []
                ];
            }

            // Initialize section if not set
            if (!isset($programs[$schedule->program_id]['year_levels'][$schedule->year_level]['sections'][$schedule->section_name])) {
                $programs[$schedule->program_id]['year_levels'][$schedule->year_level]['sections'][$schedule->section_name] = [
                    'section_name' => $schedule->section_name,
                    'schedules' => []
                ];
            }

            // If there's a schedule, add it to the schedules array
            if ($schedule->schedule_id) {
                $programs[$schedule->program_id]['year_levels'][$schedule->year_level]['sections'][$schedule->section_name]['schedules'][] = [
                    'schedule_id' => $schedule->schedule_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'faculty_name' => $schedule->faculty_name,
                    'faculty_code' => $schedule->faculty_code,
                    'room_code' => $schedule->room_code,
                    'course_details' => [
                        'course_assignment_id' => $schedule->course_assignment_id,
                        'course_title' => $schedule->course_title,
                        'course_code' => $schedule->course_code,
                        'lec' => $schedule->lec,
                        'lab' => $schedule->lab,
                        'units' => $schedule->units,
                        'tuition_hours' => $schedule->tuition_hours
                    ]
                ];
            }
        }

        // Step 5: Convert year_levels and sections from associative arrays to indexed arrays
        foreach ($programs as &$program) {
            $program['year_levels'] = array_values($program['year_levels']);
            foreach ($program['year_levels'] as &$yearLevel) {
                $yearLevel['sections'] = array_values($yearLevel['sections']);
            }
        }

        // Step 6: Structure the response
        return response()->json([
            'programs_schedule_reports' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester,
                'programs' => array_values($programs)
            ]
        ]);
    }
}
