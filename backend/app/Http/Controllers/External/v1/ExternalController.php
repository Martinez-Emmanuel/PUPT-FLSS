<?php

namespace App\Http\Controllers\External\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalController extends Controller
{

    /**
     * For: E-Class Record System (ECRS)
     * Retrieves faculty schedules for ECRS integration.
     * Returns faculty details with their assigned schedules for the current active semester.
     */
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
                'active_semesters.semester_id',
                'active_semesters.active_semester_id',
                'active_semesters.start_date',
                'active_semesters.end_date'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Check if there are any published schedules for the active semester
        $hasPublishedSchedules = DB::table('faculty_schedule_publication')
            ->where('faculty_schedule_publication.academic_year_id', $activeSemester->academic_year_id)
            ->where('faculty_schedule_publication.semester_id', $activeSemester->semester_id)
            ->where('faculty_schedule_publication.is_published', 1)
            ->exists();

        if (!$hasPublishedSchedules) {
            return response()->json([
                'message' => "PUP Taguig faculty load and schedules for " . "A.Y. " .
                $activeSemester->year_start . "-" . $activeSemester->year_end .
                ", " . $this->formatSemesterLabel($activeSemester->semester) .
                " is not yet published.",
            ]);
        }

        // Step 2: Prepare a subquery to get schedules for the current semester and academic year
        $schedulesSub = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->join('faculty_schedule_publication', function ($join) use ($activeSemester) {
                $join->on('faculty_schedule_publication.faculty_id', '=', 'schedules.faculty_id')
                    ->where('faculty_schedule_publication.academic_year_id', '=', $activeSemester->academic_year_id)
                    ->where('faculty_schedule_publication.semester_id', '=', $activeSemester->semester_id)
                    ->where('faculty_schedule_publication.is_published', '=', 1);
            })
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
            ->join('faculty_type', 'faculty.faculty_type_id', '=', 'faculty_type.faculty_type_id')
            ->leftJoinSub($schedulesSub, 'current_schedules', function ($join) {
                $join->on('current_schedules.faculty_id', '=', 'faculty.id');
            })
            ->leftJoin('section_courses', 'current_schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->leftJoin('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->leftJoin('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->leftJoin('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('rooms', 'rooms.room_id', '=', 'current_schedules.room_id')
            ->leftJoin('faculty_schedule_publication', function ($join) use ($activeSemester) {
                $join->on('faculty_schedule_publication.faculty_id', '=', 'faculty.id')
                    ->where('faculty_schedule_publication.academic_year_id', '=', $activeSemester->academic_year_id)
                    ->where('faculty_schedule_publication.semester_id', '=', $activeSemester->semester_id);
            })
            ->select(
                'faculty.id as faculty_id',
                'users.id as user_id',
                'users.code as faculty_code',
                'faculty_type.faculty_type',
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
            // Only process faculty members who have schedules
            if ($schedule->schedule_id) {
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

    /**
     * For: E-Class Record System (ECRS)
     * Notifies ECRS about schedule publication changes.
     * Only sends notification when schedules are being published (not unpublished).
     */
    public static function ECRSScheduleChange(string $action, bool $isPublished, ?int $facultyId = null): void
    {
        if (!$isPublished) {
            return;
        }

        $ecrsApiUrl = 'https://api-ecrs.puptcapstone.com/send-notice';

        try {
            $ecrsResponse = Http::post($ecrsApiUrl);

            $logContext = [
                'status' => $ecrsResponse->status(),
                'response' => $ecrsResponse->json(),
                'action' => $action,
                'is_published' => $isPublished,
            ];

            if ($facultyId) {
                $logContext['faculty_id'] = $facultyId;
            }

            if ($ecrsResponse->successful()) {
                Log::info('Successfully notified ECRS about schedule publication', $logContext);
            } else {
                Log::warning('Failed to notify ECRS about schedule publication', [
                     ...$logContext,
                    'response_body' => $ecrsResponse->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error while notifying ECRS about schedule publication', [
                'error' => $e->getMessage(),
                'action' => $action,
                'is_published' => $isPublished,
                'faculty_id' => $facultyId,
            ]);
        }
    }

    /**
     * For: Faculty and Room Management System (FARMS)
     * Retrieves course schedules for FARMS integration.
     */
    public function FARMSCourseSchedules()
    {
        // Step 1: Get active semester
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester',
                'active_semesters.academic_year_id',
                'active_semesters.semester_id',
                'active_semesters.active_semester_id'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Step 2: Check if there are any published schedules
        $hasPublishedSchedules = DB::table('faculty_schedule_publication')
            ->where('faculty_schedule_publication.academic_year_id', $activeSemester->academic_year_id)
            ->where('faculty_schedule_publication.semester_id', $activeSemester->semester_id)
            ->where('faculty_schedule_publication.is_published', 1)
            ->exists();

        if (!$hasPublishedSchedules) {
            return response()->json([
                'message' => "PUP Taguig faculty load and schedules for " . "A.Y. " .
                $activeSemester->year_start . "-" . $activeSemester->year_end .
                ", " . $this->formatSemesterLabel($activeSemester->semester) .
                " is not yet published.",
            ]);
        }

        // Get faculty schedules - starting with faculty table
        $schedules = DB::table('faculty')
            ->join('schedules', 'faculty.id', '=', 'schedules.faculty_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->join('programs', 'programs.program_id', '=', 'sections_per_program_year.program_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('faculty_schedule_publication', function ($join) use ($activeSemester) {
                $join->on('faculty_schedule_publication.faculty_id', '=', 'faculty.id')
                    ->where('faculty_schedule_publication.academic_year_id', '=', $activeSemester->academic_year_id)
                    ->where('faculty_schedule_publication.semester_id', '=', $activeSemester->semester_id)
                    ->where('faculty_schedule_publication.is_published', '=', 1);
            })
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->whereNotNull('schedules.day')
            ->whereNotNull('schedules.start_time')
            ->whereNotNull('schedules.end_time')
            ->select(
                'schedules.schedule_id as course_schedule_id',
                'faculty.hris_user_id as user_login_id',
                'programs.program_title as program',
                'courses.course_code',
                'courses.course_title as course_subjects',
                'sections_per_program_year.year_level',
                'sections_per_program_year.section_name',
                'section_courses.section_course_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time'
            )
            ->orderBy('faculty.hris_user_id')
            ->orderBy('section_courses.section_course_id')
            ->orderBy('schedules.day')
            ->orderBy('schedules.start_time')
            ->get();

        // Group schedules by faculty and course
        $groupedSchedules = $schedules->groupBy(function ($schedule) {
            // Create a unique key combining faculty, course, and section
            return $schedule->user_login_id . '_' .
            $schedule->course_code . '_' .
            $schedule->year_level . '-' . $schedule->section_name;
        })->map(function ($courseSchedules) {
            $firstSchedule = $courseSchedules->first();

            // Combine all schedules for this course
            $combinedSchedule = $courseSchedules
                ->sortBy(['day', 'start_time'])
                ->map(function ($schedule) {
                    return $schedule->day . ' ' .
                    date("H:i", strtotime($schedule->start_time)) . ' - ' .
                    date("H:i", strtotime($schedule->end_time));
                })->implode(', ');

            return [
                'course_schedule_id' => $firstSchedule->course_schedule_id,
                'user_login_id' => $firstSchedule->user_login_id,
                'program' => $firstSchedule->program,
                'course_code' => $firstSchedule->course_code,
                'course_subjects' => $firstSchedule->course_subjects,
                'year_section' => $firstSchedule->year_level . '-' . $firstSchedule->section_name,
                'schedule' => $combinedSchedule,
            ];
        })
            ->sortBy('user_login_id')
            ->values();

        return response()->json([
            'course_schedules' => $groupedSchedules,
        ]);
    }

    /**
     * For: Faculty and Room Management System (FARMS)
     * Retrieves course files for FARMS integration.
     */
    public function FARMSCourseFiles()
    {
        // Step 1: Get active semester
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester',
                'active_semesters.academic_year_id',
                'active_semesters.semester_id',
                'active_semesters.active_semester_id'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Step 2: Check if there are any published schedules
        $hasPublishedSchedules = DB::table('faculty_schedule_publication')
            ->where('faculty_schedule_publication.academic_year_id', $activeSemester->academic_year_id)
            ->where('faculty_schedule_publication.semester_id', $activeSemester->semester_id)
            ->where('faculty_schedule_publication.is_published', 1)
            ->exists();

        if (!$hasPublishedSchedules) {
            return response()->json([
                'message' => "PUP Taguig faculty load and schedules for " . "A.Y. " .
                $activeSemester->year_start . "-" . $activeSemester->year_end .
                ", " . $this->formatSemesterLabel($activeSemester->semester) .
                " is not yet published.",
            ]);
        }

        // Step 3: Get all course files for published schedules
        $schedulesSub = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->join('semesters as ca_semesters', 'ca_semesters.semester_id', '=', 'course_assignments.semester_id')
            ->join('sections_per_program_year', 'sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
            ->join('faculty_schedule_publication', function ($join) use ($activeSemester) {
                $join->on('faculty_schedule_publication.faculty_id', '=', 'schedules.faculty_id')
                    ->where('faculty_schedule_publication.academic_year_id', '=', $activeSemester->academic_year_id)
                    ->where('faculty_schedule_publication.semester_id', '=', $activeSemester->semester_id)
                    ->where('faculty_schedule_publication.is_published', '=', 1);
            })
            ->where('ca_semesters.semester', '=', $activeSemester->semester)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select(
                'schedules.schedule_id',
                'schedules.faculty_id',
                'schedules.section_course_id'
            );

        $courseFiles = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->leftJoinSub($schedulesSub, 'current_schedules', function ($join) {
                $join->on('current_schedules.faculty_id', '=', 'faculty.id');
            })
            ->leftJoin('section_courses', 'current_schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->leftJoin('course_assignments', 'course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
            ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
            ->leftJoin('faculty_schedule_publication', function ($join) use ($activeSemester) {
                $join->on('faculty_schedule_publication.faculty_id', '=', 'faculty.id')
                    ->where('faculty_schedule_publication.academic_year_id', '=', $activeSemester->academic_year_id)
                    ->where('faculty_schedule_publication.semester_id', '=', $activeSemester->semester_id)
                    ->where('faculty_schedule_publication.is_published', '=', 1);
            })
            ->where('faculty_schedule_publication.is_published', '=', 1)
            ->select(
                'faculty.hris_user_id as user_login_id',
                'current_schedules.schedule_id as course_schedule_id',
                'courses.course_title as subject',
                DB::raw("'" . $this->formatSemesterLabel($activeSemester->semester) . "' as semester"),
                DB::raw("'" . $activeSemester->year_start . "-" . $activeSemester->year_end . "' as school_year")
            )
            ->whereNotNull('current_schedules.schedule_id')
            ->distinct()
            ->orderBy('faculty.hris_user_id')
            ->orderBy('current_schedules.schedule_id')
            ->get();

        return response()->json([
            'courses_files' => $courseFiles,
        ]);
    }

    /**
     * For: Biometric Synchronization System (BioSync)
     * Retrieves computer laboratory schedules for BioSync integration.
     * Returns schedules for rooms with room_type "Computer Laboratory" for the current active semester.
     */

    /**
     * Room type ID for Computer Laboratory
     */
    private const COMPUTER_LABORATORY_ID = 3;

    public function BioSyncComputerLabSchedules()
    {
        // Step 1: Get active semester
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester',
                'active_semesters.academic_year_id',
                'active_semesters.semester_id'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found.'], 404);
        }

        // Step 2: Get all computer laboratory schedules with related data
        $query = DB::table('rooms')
            ->join('room_types', 'rooms.room_type_id', '=', 'room_types.room_type_id')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.building_id')
            ->join('schedules', 'rooms.room_id', '=', 'schedules.room_id')
            ->join('faculty', 'schedules.faculty_id', '=', 'faculty.id')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('courses', 'course_assignments.course_id', '=', 'courses.course_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('programs', 'sections_per_program_year.program_id', '=', 'programs.program_id')
            ->join('faculty_schedule_publication', function ($join) use ($activeSemester) {
                $join->on('faculty_schedule_publication.faculty_id', '=', 'faculty.id')
                    ->where('faculty_schedule_publication.academic_year_id', '=', $activeSemester->academic_year_id)
                    ->where('faculty_schedule_publication.semester_id', '=', $activeSemester->semester_id)
                    ->where('faculty_schedule_publication.is_published', '=', 1);
            })
            ->where('rooms.room_type_id', '=', self::COMPUTER_LABORATORY_ID)
            ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id)
            ->select(
                'rooms.room_id',
                'rooms.room_code',
                'buildings.building_name as location',
                'rooms.floor_level',
                'rooms.capacity',
                'schedules.schedule_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'users.code as faculty_code',
                DB::raw("CONCAT(users.last_name, ', ', users.first_name,
                    CASE WHEN users.middle_name IS NOT NULL THEN CONCAT(' ', users.middle_name) ELSE '' END,
                    CASE WHEN users.suffix_name IS NOT NULL THEN CONCAT(' ', users.suffix_name) ELSE '' END)
                    as faculty_name"),
                'programs.program_code',
                'programs.program_title',
                'sections_per_program_year.year_level',
                'sections_per_program_year.section_name',
                'courses.course_id',
                'courses.course_title',
                'courses.course_code',
                'courses.lec_hours as lec',
                'courses.lab_hours as lab',
                'courses.units',
                'courses.tuition_hours'
            )
            ->orderBy('rooms.room_code')
            ->orderBy('schedules.day')
            ->orderBy('schedules.start_time');

        $labSchedules = $query->get();

        // Step 3: Group schedules by room
        $rooms = $labSchedules->groupBy('room_id')->map(function ($roomSchedules) {
            $firstSchedule = $roomSchedules->first();
            return [
                'room_code' => $firstSchedule->room_code,
                'location' => $firstSchedule->location,
                'floor_level' => $firstSchedule->floor_level,
                'capacity' => $firstSchedule->capacity,
                'schedules' => $roomSchedules->map(function ($schedule) {
                    return [
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
                            'course_id' => $schedule->course_id,
                            'course_title' => $schedule->course_title,
                            'course_code' => $schedule->course_code,
                            'lec' => $schedule->lec,
                            'lab' => $schedule->lab,
                            'units' => $schedule->units,
                            'tuition_hours' => $schedule->tuition_hours,
                        ],
                    ];
                })->values()->all(),
            ];
        })->values();

        return response()->json([
            'computer_laboratory_schedules' => [
                'academic_year_start' => $activeSemester->year_start,
                'academic_year_end' => $activeSemester->year_end,
                'semester' => $activeSemester->semester,
                'rooms' => $rooms,
            ],
        ]);
    }

    /**
     * Helper method
     * Converts semester number to readable text format.
     */
    private function formatSemesterLabel(int $semesterNumber): string
    {
        return match ($semesterNumber) {
            1 => 'First Semester',
            2 => 'Second Semester',
            3 => 'Summer Semester',
            default => 'Unknown Semester'
        };
    }
}
