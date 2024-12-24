<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\ActiveSemester;
use App\Models\Faculty;
use App\Models\FacultyNotification;
use App\Models\PreferencesSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReportsController extends Controller
{
    /**
     * Get ALL Faculty Schedules Report
     */
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
                'users.id as user_id',
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

        // Step 3.1: Collect unique user_ids to fetch User models
        $userIds = $facultySchedules->pluck('user_id')->unique()->toArray();

        // Step 3.2: Fetch User models
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        // Step 4: Group the data by faculty and structure schedules
        $faculties = [];

        foreach ($facultySchedules as $schedule) {
            if (!isset($faculties[$schedule->faculty_id])) {
                $faculties[$schedule->faculty_id] = [
                    'faculty_id' => $schedule->faculty_id,
                    'faculty_name' => $users[$schedule->user_id]->formatted_name ?? 'N/A',
                    'faculty_code' => $schedule->faculty_code,
                    'faculty_type' => $schedule->faculty_type,
                    'assigned_units' => 0,
                    'is_published' => 0,
                    'schedules' => [],
                    'tracked_courses' => [],
                ];
            }

            if ($schedule->schedule_id) {
                // Only add units if we haven't counted this course assignment before
                if (!in_array($schedule->course_assignment_id, $faculties[$schedule->faculty_id]['tracked_courses'])) {
                    $faculties[$schedule->faculty_id]['assigned_units'] += $schedule->units;
                    $faculties[$schedule->faculty_id]['tracked_courses'][] = $schedule->course_assignment_id;
                }

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
                        'tuition_hours' => $schedule->tuition_hours,
                    ],
                ];
            }
        }

        // Remove the tracking array before sending response
        foreach ($faculties as &$faculty) {
            unset($faculty['tracked_courses']);
        }

        // Step 4.1: Sort the faculties by faculty_name
        $faculties = collect($faculties)->sortBy('faculty_name')->values()->all();

        // Step 5: Structure the response
        return response()->json([
            'faculty_schedule_reports' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester,
                'faculties' => array_values($faculties),
            ],
        ]);
    }

    /**
     * Get Room Schedules Report
     */
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
                'faculty.user_id',
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

        // Step 3.1: Collect unique user_ids to fetch User models
        $userIds = $roomSchedules->pluck('user_id')->unique()->filter()->toArray();

        // Step 3.2: Fetch User models
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

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
                    'schedules' => [],
                ];
            }

            if ($schedule->schedule_id) {
                $facultyName = isset($users[$schedule->user_id]) ? $users[$schedule->user_id]->formatted_name : 'N/A';

                $rooms[$schedule->room_id]['schedules'][] = [
                    'schedule_id' => $schedule->schedule_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'faculty_name' => $facultyName,
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
                        'tuition_hours' => $schedule->tuition_hours,
                    ],
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
                'rooms' => array_values($rooms),
            ],
        ]);
    }

    /**
     * Get Program Schedules Report
     */
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
                'faculty.user_id',
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

        // Step 3.1: Collect unique user_ids to fetch User models
        $userIds = $programSchedules->pluck('user_id')->unique()->filter()->toArray();

        // Step 3.2: Fetch User models
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        // Step 4: Group the data by program, year level, and section
        $programs = [];

        foreach ($programSchedules as $schedule) {
            if (!isset($programs[$schedule->program_id])) {
                $programs[$schedule->program_id] = [
                    'program_id' => $schedule->program_id,
                    'program_code' => $schedule->program_code,
                    'program_title' => $schedule->program_title,
                    'year_levels' => [],
                ];
            }

            // Initialize year_level if not set
            if (!isset($programs[$schedule->program_id]['year_levels'][$schedule->year_level])) {
                $programs[$schedule->program_id]['year_levels'][$schedule->year_level] = [
                    'year_level' => $schedule->year_level,
                    'sections' => [],
                ];
            }

            // Initialize section if not set
            if (!isset($programs[$schedule->program_id]['year_levels'][$schedule->year_level]['sections'][$schedule->section_name])) {
                $programs[$schedule->program_id]['year_levels'][$schedule->year_level]['sections'][$schedule->section_name] = [
                    'section_name' => $schedule->section_name,
                    'schedules' => [],
                ];
            }

            // Check if the schedule has a valid schedule_id
            if ($schedule->schedule_id) {
                $facultyName = isset($users[$schedule->user_id]) ? $users[$schedule->user_id]->formatted_name : 'N/A';

                $programs[$schedule->program_id]['year_levels'][$schedule->year_level]['sections'][$schedule->section_name]['schedules'][] = [
                    'schedule_id' => $schedule->schedule_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'faculty_name' => $facultyName,
                    'faculty_code' => $schedule->faculty_code,
                    'room_code' => $schedule->room_code,
                    'course_details' => [
                        'course_assignment_id' => $schedule->course_assignment_id,
                        'course_title' => $schedule->course_title,
                        'course_code' => $schedule->course_code,
                        'lec' => $schedule->lec,
                        'lab' => $schedule->lab,
                        'units' => $schedule->units,
                        'tuition_hours' => $schedule->tuition_hours,
                    ],
                ];
            }
        }

        // Convert year_levels and sections from associative arrays to indexed arrays
        foreach ($programs as &$program) {
            $program['year_levels'] = array_values($program['year_levels']);
            foreach ($program['year_levels'] as &$yearLevel) {
                $yearLevel['sections'] = array_values($yearLevel['sections']);
            }
        }

        // Step 5: Structure the response
        return response()->json([
            'programs_schedule_reports' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester,
                'programs' => array_values($programs),
            ],
        ]);
    }

    /**
     * Get a single faculty schedule for the current active academic year and semester
     */
    public function getSingleFacultySchedule($faculty_id)
    {
        // Step 1: Validate the faculty_id
        $validator = Validator::make(['faculty_id' => $faculty_id], [
            'faculty_id' => 'required|integer|exists:faculty,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid faculty_id provided.'], 400);
        }

        // Step 2: Get active semester info
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
                'semesters.semester',
                'active_semesters.start_date',
                'active_semesters.end_date'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Step 3: Get basic faculty info
        $faculty = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->where('faculty.id', $faculty_id)
            ->select(
                'faculty.id as faculty_id',
                'users.id as user_id',
                'users.code as faculty_code',
                'faculty.faculty_type'
            )
            ->first();

        if (!$faculty) {
            return response()->json(['message' => 'Faculty not found.'], 404);
        }

        // Step 4: Prepare the base response
        $response = [
            'faculty_schedule' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester,
                'start_date' => $activeSemester->start_date,
                'end_date' => $activeSemester->end_date,
                'faculty_id' => $faculty->faculty_id,
                'faculty_name' => 'N/A',
                'faculty_code' => $faculty->faculty_code,
                'faculty_type' => $faculty->faculty_type,
                'assigned_units' => 0,
                'total_hours' => 0,
                'is_published' => 0,
                'schedules' => [],
            ],
        ];

        // Step 5: Fetch User model for the faculty
        $user = User::find($faculty->user_id);
        if ($user) {
            $response['faculty_schedule']['faculty_name'] = $user->formatted_name;
        }

        // Step 6: Fetch schedules with publication status
        $facultySchedules = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('rooms', 'rooms.room_id', '=', 'schedules.room_id')
            ->leftJoin('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->leftJoin('faculty_schedule_publication', function ($join) use ($faculty_id) {
                $join->on('faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
                    ->where('faculty_schedule_publication.faculty_id', '=', $faculty_id);
            })
            ->where('schedules.faculty_id', '=', $faculty->faculty_id)
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select(
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

        // Step 7: Collect unique course_assignment_ids to calculate assigned_units and total_hours
        $trackedCourses = [];
        foreach ($facultySchedules as $schedule) {
            if ($schedule->is_published == 1) {
                $response['faculty_schedule']['is_published'] = 1;
            }

            if ($schedule->course_assignment_id && !in_array($schedule->course_assignment_id, $trackedCourses)) {
                $response['faculty_schedule']['assigned_units'] += $schedule->units;
                $response['faculty_schedule']['total_hours'] += $schedule->tuition_hours;
                $trackedCourses[] = $schedule->course_assignment_id;
            }

            // Only add the schedule details if it is published
            if ($schedule->is_published == 1) {
                $response['faculty_schedule']['schedules'][] = [
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
                        'tuition_hours' => $schedule->tuition_hours,
                    ],
                ];
            }
        }

        // Update the overall publication status
        if ($response['faculty_schedule']['is_published'] == 0) {
            $response['faculty_schedule']['schedules'] = [];
        }

        return response()->json($response);
    }

    /**
     * Get a single Faculty Schedule for the current active academic year and semester
     */

    public function getFacultyScheduleHistory($faculty_id, Request $request)
    {
        // Step 1: Validate input
        $validator = Validator::make(array_merge($request->all(), ['faculty_id' => $faculty_id]), [
            'faculty_id' => 'required|integer|exists:faculty,id',
            'active_semester_id' => 'required|integer|exists:active_semesters,active_semester_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid input parameters',
                'errors' => $validator->errors(),
            ], 400);
        }

        $active_semester_id = $request->input('active_semester_id');

        // Step 2: Get semester and academic year info
        $semesterInfo = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.active_semester_id', $active_semester_id)
            ->select(
                'active_semesters.active_semester_id',
                'active_semesters.academic_year_id',
                'active_semesters.semester_id',
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester',
                'active_semesters.start_date',
                'active_semesters.end_date'
            )
            ->first();

        if (!$semesterInfo) {
            return response()->json(['message' => 'Semester information not found.'], 404);
        }

        // Step 3: Get faculty basic info
        $faculty = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->where('faculty.id', $faculty_id)
            ->select(
                'faculty.id as faculty_id',
                'users.id as user_id',
                'users.code as faculty_code',
                'faculty.faculty_type',
                DB::raw("CONCAT(users.last_name, ', ', users.first_name) as faculty_name")
            )
            ->first();

        if (!$faculty) {
            return response()->json(['message' => 'Faculty not found.'], 404);
        }

        // Step 4: Get schedules with corrected semester join logic
        $schedulesQuery = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('rooms', 'rooms.room_id', '=', 'schedules.room_id')
            ->leftJoin('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->where('schedules.faculty_id', $faculty_id)
            ->where('sections_per_program_year.academic_year_id', $semesterInfo->academic_year_id)
            ->where('ca_semesters.semester', $semesterInfo->semester)
            ->select(
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
                'sections_per_program_year.section_name'
            );

        $schedules = $schedulesQuery->get();

        // Step 5: Calculate totals and transform data
        $trackedCourses = [];
        $assignedUnits = 0;
        $totalHours = 0;
        $transformedSchedules = [];

        foreach ($schedules as $schedule) {
            if (!in_array($schedule->course_assignment_id, $trackedCourses)) {
                $assignedUnits += $schedule->units;
                $totalHours += $schedule->tuition_hours;
                $trackedCourses[] = $schedule->course_assignment_id;
            }

            $transformedSchedules[] = [
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
                    'tuition_hours' => $schedule->tuition_hours,
                ],
            ];
        }

        // Step 6: Prepare response
        $response = [
            'faculty_schedule' => [
                'academic_year_id' => $semesterInfo->academic_year_id,
                'year_start' => $semesterInfo->year_start,
                'year_end' => $semesterInfo->year_end,
                'active_semester_id' => $semesterInfo->active_semester_id,
                'semester' => $semesterInfo->semester,
                'start_date' => $semesterInfo->start_date,
                'end_date' => $semesterInfo->end_date,
                'faculty_id' => $faculty->faculty_id,
                'faculty_name' => $faculty->faculty_name,
                'faculty_code' => $faculty->faculty_code,
                'faculty_type' => $faculty->faculty_type,
                'assigned_units' => $assignedUnits,
                'total_hours' => $totalHours,
                'schedules' => $transformedSchedules,
            ],
        ];

        return response()->json($response);
    }

    /**
     * Retrieves academic years and semesters where a faculty had schedules &
     * ensure these are before the current active academic year and semester
     */
    public function getFacultyAcademicYearsHistory($faculty_id)
    {
        $validator = Validator::make(['faculty_id' => $faculty_id], [
            'faculty_id' => 'required|integer|exists:faculty,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid faculty ID',
                'errors' => $validator->errors(),
            ], 400);
        }

        // Retrieve the current active academic year
        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json([
                'message' => 'No active academic year found.',
            ], 404);
        }

        // Retrieve the current active semester within the active academic year
        $activeSemester = ActiveSemester::where('academic_year_id', $activeYear->academic_year_id)
            ->where('is_active', true)
            ->first();

        if (!$activeSemester) {
            return response()->json([
                'message' => 'No active semester found for the current academic year.',
            ], 404);
        }

        // Fetch distinct academic years and semesters where the faculty had schedules using active_semesters
        $schedules = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('academic_years', 'sections_per_program_year.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('active_semesters', 'academic_years.academic_year_id', '=', 'active_semesters.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('schedules.faculty_id', $faculty_id)
            ->where(function ($query) use ($activeYear, $activeSemester) {
                $query->where('academic_years.academic_year_id', '<', $activeYear->academic_year_id)
                    ->orWhere(function ($q) use ($activeYear, $activeSemester) {
                        $q->where('academic_years.academic_year_id', '=', $activeYear->academic_year_id)
                            ->where('semesters.semester_id', '<', $activeSemester->semester_id);
                    });
            })
            ->select(
                'academic_years.academic_year_id',
                'academic_years.year_start',
                DB::raw("CONCAT(academic_years.year_start, '-', academic_years.year_end) as academic_year"),
                'active_semesters.active_semester_id',
                'semesters.semester_id',
                'semesters.semester as semester_number',
                'active_semesters.start_date',
                'active_semesters.end_date'
            )
            ->distinct()
            ->orderBy('academic_years.year_start', 'desc')
            ->orderBy('semesters.semester', 'asc')
            ->get();

        $groupedAcademicYears = [];

        foreach ($schedules as $schedule) {
            if (!isset($groupedAcademicYears[$schedule->academic_year_id])) {
                $groupedAcademicYears[$schedule->academic_year_id] = [
                    'academic_year_id' => $schedule->academic_year_id,
                    'academic_year' => $schedule->academic_year,
                    'semesters' => [],
                ];
            }

            $semesterLabel = '';
            if ($schedule->semester_number == 1) {
                $semesterLabel = '1st Semester';
            } elseif ($schedule->semester_number == 2) {
                $semesterLabel = '2nd Semester';
            } elseif ($schedule->semester_number == 3) {
                $semesterLabel = 'Summer Semester';
            }

            $groupedAcademicYears[$schedule->academic_year_id]['semesters'][] = [
                'active_semester_id' => $schedule->active_semester_id,
                'semester_id' => $schedule->semester_id,
                'semester_number' => $semesterLabel,
                'start_date' => $schedule->start_date,
                'end_date' => $schedule->end_date,
            ];
        }

        return response()->json(array_values($groupedAcademicYears));
    }

    /**
     * Toggle all schedules publication status
     */
    public function toggleAllSchedules(Request $request)
    {
        // Step 1: Validate the input
        $validated = $request->validate([
            'is_published' => 'required|boolean',
        ]);

        $isPublished = $validated['is_published'];

        // Step 2: Get the active semester and academic year
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 404);
        }

        $activeAcademicYearId = $activeSemester->academic_year_id;
        $activeSemesterId = $activeSemester->semester_id;

        // Step 3: Fetch schedule IDs for the active semester and academic year
        $activeSchedules = DB::table('schedules')
            ->select('schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters', 'course_assignments.semester_id', '=', 'semesters.semester_id')
            ->where('sections_per_program_year.academic_year_id', '=', $activeAcademicYearId)
            ->where('semesters.semester', '=', $activeSemesterId)
            ->pluck('schedules.schedule_id');

        if ($activeSchedules->isEmpty()) {
            return response()->json(['message' => 'No schedules found for the active semester and academic year.'], 404);
        }

        // Step 4: Update `is_published` for the fetched schedules in the `schedules` table
        $updatedCount = DB::table('schedules')
            ->whereIn('schedule_id', $activeSchedules)
            ->update(['is_published' => $isPublished]);

        // Step 5: Update `is_published` in the `faculty_schedule_publication` table based on the same schedule IDs
        DB::table('faculty_schedule_publication')
            ->whereIn('schedule_id', $activeSchedules)
            ->update(['is_published' => $isPublished, 'updated_at' => now()]);

        // Step 6: Disable preferences for all faculty by setting `is_enabled` to 0
        DB::table('preferences_settings')
            ->update([
                'is_enabled' => 0,
                'global_deadline' => null,
                'individual_deadline' => null,
                'updated_at' => now(),
            ]);

        // Step 7: Prepare notification message
        $academicYear = $this->getCurrentAcademicYear();
        $message = $isPublished
        ? "Schedules have been published for A.Y. {$academicYear}."
        : "Schedules have been unpublished for A.Y. {$academicYear}.";

        // Step 8: Fetch all faculty IDs
        $facultyIds = Faculty::pluck('id');

        // Step 9: Create notifications for all faculties
        $notifications = $facultyIds->map(function ($facultyId) use ($message) {
            return [
                'faculty_id' => $facultyId,
                'message' => $message,
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        FacultyNotification::insert($notifications);

        // Step 10: Return a response
        return response()->json([
            'message' => 'Schedules and faculty schedule publications updated successfully',
            'updated_count' => $updatedCount,
            'is_published' => $isPublished,
            'active_semester_id' => $activeSemester->active_semester_id,
            'academic_year_id' => $activeAcademicYearId,
            'semester_id' => $activeSemesterId,
        ]);
    }

    /**
     * Toggle a single faculty schedules publication status
     */
    public function toggleSingleSchedule(Request $request)
    {
        // Step 1: Validate the input
        $request->validate([
            'faculty_id' => 'required|integer|exists:faculty,id',
            'is_published' => 'required|boolean',
        ]);

        $facultyId = $request->input('faculty_id');
        $isPublished = $request->input('is_published');

        // Step 2: Get the active semester and academic year
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 404);
        }

        $activeAcademicYearId = $activeSemester->academic_year_id;
        $activeSemesterId = $activeSemester->semester_id;

        // Step 3: Fetch all related schedule_ids from the faculty_schedule_publication table
        $facultySchedules = DB::table('faculty_schedule_publication')
            ->join('schedules', 'faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters', 'course_assignments.semester_id', '=', 'semesters.semester_id')
            ->where('faculty_schedule_publication.faculty_id', $facultyId)
            ->where('sections_per_program_year.academic_year_id', '=', $activeAcademicYearId)
            ->where('semesters.semester', '=', $activeSemesterId)
            ->pluck('schedules.schedule_id', 'faculty_schedule_publication.faculty_schedule_publication_id');

        if ($facultySchedules->isEmpty()) {
            return response()->json(['message' => 'No schedules found for the given faculty in the active semester and academic year'], 404);
        }

        // Step 4: Update the is_published value in the faculty_schedule_publication table for active schedules
        DB::table('faculty_schedule_publication')
            ->whereIn('faculty_schedule_publication_id', $facultySchedules->keys())
            ->update(['is_published' => $isPublished, 'updated_at' => now()]);

        // Step 5: Update the corresponding is_published value in the schedules table for active schedules
        DB::table('schedules')
            ->whereIn('schedule_id', $facultySchedules->values())
            ->update(['is_published' => $isPublished, 'updated_at' => now()]);

        // Step 6: Disable preferences for the individual faculty by setting `is_enabled` to 0
        DB::table('preferences_settings')
            ->where('faculty_id', $facultyId)
            ->update([
                'is_enabled' => 0,
                'global_deadline' => null,
                'individual_deadline' => null,
                'updated_at' => now(),
            ]);

        // Step 7: Prepare notification message
        $academicYear = $this->getCurrentAcademicYear();
        $message = $isPublished
        ? "Your schedule has been published for A.Y. {$academicYear}."
        : "Your schedule has been unpublished for A.Y. {$academicYear}.";

        // Step 8: Create notification for the specific faculty
        FacultyNotification::create([
            'faculty_id' => $facultyId,
            'message' => $message,
            'is_read' => 0,
        ]);

        // Step 9: Return a success response
        return response()->json([
            'message' => 'Publication status updated successfully for the faculty',
            'faculty_id' => $facultyId,
            'is_published' => $isPublished,
            'updated_schedule_ids' => $facultySchedules->values(),
        ]);
    }

    /**
     * Check if a schedule is valid
     */
    private function isScheduleValid($schedule)
    {
        return !(
            is_null($schedule->day) &&
            is_null($schedule->start_time) &&
            is_null($schedule->end_time) &&
            is_null($schedule->faculty_name) &&
            is_null($schedule->faculty_code) &&
            is_null($schedule->room_code)
        );
    }

    /**
     * Get overview details for the current active academic year and semester
     */
    public function getOverviewDetails()
    {
        // Step 1: Retrieve the current active semester with academic year details
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'academic_years.academic_year_id',
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester',
                'active_semesters.active_semester_id'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Step 2: Count the number of active faculty
        $activeFacultyCount = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->where('users.status', 'Active')
            ->count();

        // Step 3: Count the number of active programs in the current academic year
        $activeProgramsCount = DB::table('program_year_level_curricula')
            ->where('academic_year_id', $activeSemester->academic_year_id)
            ->distinct('program_id')
            ->count('program_id');

        // Step 4: Retrieve active curricula used in the current academic year
        $activeCurricula = DB::table('program_year_level_curricula')
            ->join('curricula', 'program_year_level_curricula.curriculum_id', '=', 'curricula.curriculum_id')
            ->where('program_year_level_curricula.academic_year_id', $activeSemester->academic_year_id)
            ->distinct()
            ->select('curricula.curriculum_id', 'curricula.curriculum_year')
            ->get();

        // Step 5: Calculate Preferences Progress
        $preferencesWithEntries = DB::table('preferences_settings')
            ->join('preferences', function ($join) use ($activeSemester) {
                $join->on('preferences.faculty_id', '=', 'preferences_settings.faculty_id')
                    ->where('preferences.active_semester_id', '=', $activeSemester->active_semester_id);
            })
            ->where('preferences_settings.is_enabled', 0)
            ->distinct('preferences_settings.faculty_id')
            ->count('preferences_settings.faculty_id');

        $submittedProperlyCount = $preferencesWithEntries;
        $preferencesProgress = $activeFacultyCount > 0 ? ($submittedProperlyCount / $activeFacultyCount) * 100 : 0;

        // Step 6: Calculate Scheduling Progress
        $schedules = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select('schedules.day', 'schedules.start_time', 'schedules.end_time', 'schedules.faculty_id', 'schedules.room_id')
            ->get();

        $totalSchedules = $schedules->count();
        $totalNullFields = $schedules->reduce(function ($carry, $schedule) {
            return $carry +
                (is_null($schedule->day) ? 1 : 0) +
                (is_null($schedule->start_time) ? 1 : 0) +
                (is_null($schedule->end_time) ? 1 : 0) +
                (is_null($schedule->faculty_id) ? 1 : 0) +
                (is_null($schedule->room_id) ? 1 : 0);
        }, 0);

        $totalPossibleFields = $totalSchedules * 5;
        $schedulingProgress = $totalPossibleFields > 0 ? 100 - ($totalNullFields / $totalPossibleFields * 100) : 100;

        // Step 7: Calculate Room Utilization
        $totalRooms = DB::table('rooms')->count();
        $usedRooms = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->distinct('schedules.room_id')
            ->count('schedules.room_id');

        $roomUtilization = $totalRooms > 0 ? ($usedRooms / $totalRooms) * 100 : 0;

        // Step 8: Calculate Published Schedules
        $publishedSchedules = DB::table('faculty_schedule_publication')
            ->join('schedules', 'faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->where('faculty_schedule_publication.is_published', 1)
            ->distinct('faculty_schedule_publication.faculty_id')
            ->count('faculty_schedule_publication.faculty_id');

        $publishProgress = $activeFacultyCount > 0 ? ($publishedSchedules / $activeFacultyCount) * 100 : 0;

        // Step 9: Calculate preferencesSubmissionEnabled
        if ($activeFacultyCount > 0) {
            $preferencesSubmissionEnabled = PreferencesSetting::where('is_enabled', 1)->count() === $activeFacultyCount;
        } else {
            $preferencesSubmissionEnabled = true;
        }

        // Step 10: Count the number of faculty who have at least one schedule
        $facultyWithSchedulesCount = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->distinct('schedules.faculty_id')
            ->count('schedules.faculty_id');

        $globalDeadline = DB::table('preferences_settings')
            ->whereNotNull('global_deadline')
            ->value('global_deadline');

        $globalStartDate = DB::table('preferences_settings')
            ->whereNotNull('global_start_date')
            ->value('global_start_date');

        // Step 11: Structure the response with the new field
        return response()->json([
            'activeAcademicYear' => "{$activeSemester->year_start}-{$activeSemester->year_end}",
            'activeSemester' => $this->getSemesterLabel($activeSemester->semester),
            'activeFacultyCount' => $activeFacultyCount,
            'activeProgramsCount' => $activeProgramsCount,
            'activeCurricula' => $activeCurricula,
            'preferencesProgress' => round($preferencesProgress, 0),
            'schedulingProgress' => round($schedulingProgress, 0),
            'roomUtilization' => round($roomUtilization, 0),
            'publishProgress' => round($publishProgress, 0),
            'preferencesSubmissionEnabled' => $preferencesSubmissionEnabled,
            'facultyWithSchedulesCount' => $facultyWithSchedulesCount,
            'global_deadline' => $globalDeadline,
            'global_start_date' => $globalStartDate,
        ]);
    }

    /**
     * Get the semester label
     */
    private function getSemesterLabel($semesterNumber)
    {
        switch ($semesterNumber) {
            case 1:
                return '1st Semester';
            case 2:
                return '2nd Semester';
            case 3:
                return 'Summer Semester';
            default:
                return 'Unknown Semester';
        }
    }

    /**
     * Get the current active academic year in 'YYYY-YYYY' format.
     */
    private function getCurrentAcademicYear()
    {
        $activeSemester = ActiveSemester::with('academicYear')->where('is_active', 1)->first();
        if ($activeSemester && $activeSemester->academicYear) {
            return $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end;
        }
        return 'N/A';
    }
}
