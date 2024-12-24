<?php

namespace App\Http\Controllers\External\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ExternalController extends Controller
{
    public function ECRSFacultySchedules()
    {
        // Step 1: Retrieve the current active semester with academic year details
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester',
                'active_semesters.academic_year_id',
                'active_semesters.active_semester_id',
                'active_semesters.start_date',
                'active_semesters.end_date'
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
                    'last_name' => $users[$schedule->user_id]->last_name ?? null,
                    'first_name' => $users[$schedule->user_id]->first_name ?? null,
                    'middle_name' => $users[$schedule->user_id]->middle_name ?? null,
                    'suffix_name' => $users[$schedule->user_id]->suffix_name ?? null,
                    'faculty_code' => $schedule->faculty_code,
                    'faculty_type' => $schedule->faculty_type,
                    'assigned_units' => 0,
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

                $faculties[$schedule->faculty_id]['schedules'][] = [
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
        // $faculties = collect($faculties)->sortBy('faculty_name')->values()->all();

        // Step 5: Structure the response
        return response()->json([
            'pupt_faculty_schedules' => [
                'academic_year_start' => $activeSemester->year_start,
                'academic_year_end' => $activeSemester->year_end,
                'semester' => $activeSemester->semester,
                'start_date' => $activeSemester->start_date,
                'end_date' => $activeSemester->end_date,
                'faculties' => array_values($faculties),
            ],
        ]);
    }
}
