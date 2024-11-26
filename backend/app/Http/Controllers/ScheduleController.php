<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\FacultySchedulePublication;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    /**
     * Populates schedules for the active semester.
     */
    public function populateSchedules()
    {
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 404);
        }

        $activeAcademicYearId = $activeSemester->academic_year_id;

        // Fetch all assigned courses for the active semester and academic year
        $assignedCourses = DB::table('curricula as c')
            ->select(
                'p.program_id',
                'p.program_code',
                'p.program_title',
                'cp.curricula_program_id',
                'c.curriculum_id',
                'c.curriculum_year',
                'yl.year_level_id',
                'yl.year as year_level',
                's.semester_id',
                's.semester',
                'ca.course_assignment_id',
                'co.course_id',
                'co.course_code',
                'co.course_title',
                'co.lec_hours',
                'co.lab_hours',
                'co.units',
                'co.tuition_hours',
                'pylc.academic_year_id'
            )
            ->join('curricula_program as cp', 'c.curriculum_id', '=', 'cp.curriculum_id')
            ->join('programs as p', 'cp.program_id', '=', 'p.program_id')
            ->join('year_levels as yl', 'cp.curricula_program_id', '=', 'yl.curricula_program_id')
            ->join('semesters as s', 'yl.year_level_id', '=', 's.year_level_id')
            ->join('program_year_level_curricula as pylc', function ($join) {
                $join->on('pylc.program_id', '=', 'p.program_id')
                    ->on('pylc.year_level', '=', 'yl.year')
                    ->on('pylc.curriculum_id', '=', 'c.curriculum_id');
            })
            ->leftJoin('course_assignments as ca', function ($join) {
                $join->on('ca.curricula_program_id', '=', 'cp.curricula_program_id')
                    ->on('ca.semester_id', '=', 's.semester_id');
            })
            ->leftJoin('courses as co', 'ca.course_id', '=', 'co.course_id')
            ->where('s.semester', $activeSemester->semester_id)
            ->where('pylc.academic_year_id', $activeAcademicYearId)
            ->orderBy('p.program_id')
            ->orderBy('yl.year')
            ->orderBy('s.semester')
            ->orderBy('co.course_code')
            ->get();

        $response = [];

        foreach ($assignedCourses as $row) {
            // Organize data hierarchically: Program -> Year Level -> Semester -> Sections -> Courses
            $programIndex = $this->findOrCreateProgram($response, $row);
            $yearLevelIndex = $this->findOrCreateYearLevel($response[$programIndex]['year_levels'], $row);
            $semesterIndex = $this->findOrCreateSemester($response[$programIndex]['year_levels'][$yearLevelIndex]['semesters'], $row);

            // Fetch sections for the current program-year level
            $sections = DB::table('sections_per_program_year')
                ->where('program_id', $row->program_id)
                ->where('year_level', $row->year_level)
                ->where('academic_year_id', $activeAcademicYearId)
                ->get();

            foreach ($sections as $section) {
                // Ensure section_courses entry exists for each assigned course
                $this->ensureSectionCourseExists($row, $section);

                // Now assign the course to each section with a specific schedule
                $this->assignCourseToSectionAndSchedule($row, $section, $response[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections']);
            }
        }

        // Determine if submission is enabled by checking `is_enabled` in `preferences_settings`
        $isSubmissionEnabled = DB::table('preferences_settings')
            ->where('is_enabled', 1)
            ->exists() ? 1 : 0;

        return response()->json([
            'active_semester_id' => $activeSemester->active_semester_id,
            'academic_year_id' => $activeAcademicYearId,
            'semester_id' => $activeSemester->semester_id,
            'is_submission_enabled' => $isSubmissionEnabled,
            'programs' => $response,
        ]);
    }

    /**
     * Duplicates a course assignment.
     */
    public function duplicateCourse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'section_course_id' => 'required|exists:section_courses,section_course_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $originalSectionCourseId = $request->input('section_course_id');

        // Fetch the original section_course
        $originalSectionCourse = DB::table('section_courses')->where('section_course_id', $originalSectionCourseId)->first();

        if (!$originalSectionCourse) {
            return response()->json(['message' => 'Original section course not found'], 404);
        }

        // Prevent duplicating a course copy
        if ($originalSectionCourse->is_copy) {
            return response()->json(['message' => 'Cannot duplicate a copied course'], 400);
        }

        // Duplicate the section_course with is_copy = 1
        $newSectionCourseId = DB::table('section_courses')->insertGetId([
            'sections_per_program_year_id' => $originalSectionCourse->sections_per_program_year_id,
            'course_assignment_id' => $originalSectionCourse->course_assignment_id,
            'is_copy' => 1, // Mark as copy
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create a new schedule with null fields for the copied course
        $newScheduleId = DB::table('schedules')->insertGetId([
            'section_course_id' => $newSectionCourseId,
            'day' => null,
            'start_time' => null,
            'end_time' => null,
            'faculty_id' => null,
            'room_id' => null,
            'is_published' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Fetch course details
        $course = DB::table('course_assignments as ca')
            ->join('courses as co', 'ca.course_id', '=', 'co.course_id')
            ->where('ca.course_assignment_id', $originalSectionCourse->course_assignment_id)
            ->select('co.course_id', 'co.course_code', 'co.course_title', 'co.lec_hours', 'co.lab_hours', 'co.units', 'co.tuition_hours')
            ->first();

        // Prepare the response
        $response = [
            'section_course_id' => $newSectionCourseId,
            'is_copy' => 1,
            'course_id' => $course->course_id,
            'course_code' => $course->course_code,
            'course_title' => $course->course_title,
            'lec_hours' => $course->lec_hours,
            'lab_hours' => $course->lab_hours,
            'units' => $course->units,
            'tuition_hours' => $course->tuition_hours,
            'schedule' => [
                'schedule_id' => $newScheduleId,
                'day' => 'Not set',
                'start_time' => null,
                'end_time' => null,
            ],
            'professor' => 'Not set',
            'faculty_id' => null,
            'faculty_email' => null,
            'room' => [
                'room_id' => null,
                'room_code' => 'Not set',
            ],
        ];

        return response()->json([
            'message' => 'Course duplicated successfully',
            'course' => $response,
        ], 201);
    }

    /**
     * Removes a duplicated course.
     */
    public function removeDuplicateCourse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'section_course_id' => 'required|exists:section_courses,section_course_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $sectionCourseId = $request->input('section_course_id');

        // Fetch the section_course
        $sectionCourse = DB::table('section_courses')->where('section_course_id', $sectionCourseId)->first();

        if (!$sectionCourse) {
            return response()->json(['message' => 'Section course not found'], 404);
        }

        // Ensure it's a copy
        if (!$sectionCourse->is_copy) {
            return response()->json(['message' => 'Cannot remove original course'], 400);
        }

        // Delete the schedule(s) associated with this section_course
        DB::table('schedules')->where('section_course_id', $sectionCourseId)->delete();

        // Delete the section_course
        DB::table('section_courses')->where('section_course_id', $sectionCourseId)->delete();

        return response()->json(['message' => 'Copied course removed successfully'], 200);
    }

    /**
     * Assigns a schedule to a course section.
     */
    public function assignSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,schedule_id',
            'faculty_id' => 'nullable|exists:faculty,id',
            'room_id' => 'nullable|exists:rooms,room_id',
            'day' => 'nullable|string|max:10',
            'start_time' => 'nullable|date_format:H:i:s',
            'end_time' => 'nullable|date_format:H:i:s|after:start_time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Step 2: Retrieve the schedule using the schedule_id from the request
        $schedule = Schedule::find($request->input('schedule_id'));

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        // Step 3: Assign the validated data to the schedule inside a transaction
        DB::beginTransaction();

        try {
            $previousFacultyId = $schedule->faculty_id;

            $schedule->faculty_id = $request->input('faculty_id');
            $schedule->room_id = $request->input('room_id');
            $schedule->day = $request->input('day');
            $schedule->start_time = $request->input('start_time');
            $schedule->end_time = $request->input('end_time');

            $schedule->is_published = 0;
            $schedule->save();

            if ($request->input('faculty_id')) {
                if ($previousFacultyId) {
                    FacultySchedulePublication::where('faculty_id', $previousFacultyId)
                        ->where('schedule_id', $schedule->schedule_id)
                        ->delete();
                }

                FacultySchedulePublication::updateOrCreate(
                    [
                        'faculty_id' => $request->input('faculty_id'),
                        'schedule_id' => $schedule->schedule_id,
                    ],
                    [
                        'is_published' => 0,
                    ]
                );
            } elseif ($previousFacultyId) {
                FacultySchedulePublication::where('faculty_id', $previousFacultyId)
                    ->where('schedule_id', $schedule->schedule_id)
                    ->delete();
            }

            // Optionally, load related faculty and room details
            $schedule->load(['faculty.user', 'room']);

            // Prepare the response data
            $responseData = [
                'message' => 'Schedule updated successfully',
                'schedule_id' => $schedule->schedule_id,
                'schedule_details' => [
                    'schedule_id' => $schedule->schedule_id,
                    'section_course_id' => $schedule->section_course_id,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'faculty' => $schedule->faculty ? [
                        'faculty_id' => $schedule->faculty->id,
                        'name' => $schedule->faculty->user->name,
                        'email' => $schedule->faculty->user->email,
                    ] : null,
                    'room' => $schedule->room ? [
                        'room_id' => $schedule->room->room_id,
                        'room_code' => $schedule->room->room_code,
                    ] : null,
                    'created_at' => $schedule->created_at,
                    'updated_at' => $schedule->updated_at,
                ],
            ];

            // Commit the transaction after all database operations succeed
            DB::commit();

            return response()->json($responseData, 200);
        } catch (\Exception $e) {
            // Rollback the transaction if any exception occurs
            DB::rollBack();

            Log::error("Error updating schedule ID {$request->input('schedule_id')}: " . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Ensures that each course has a corresponding entry in section_courses.
     */
    private function ensureSectionCourseExists($row, $section)
    {
        // Skip if the course_assignment_id is null to avoid constraint violations
        if (is_null($row->course_assignment_id)) {
            return;
        }

        $existingSectionCourse = DB::table('section_courses')
            ->where('sections_per_program_year_id', $section->sections_per_program_year_id)
            ->where('course_assignment_id', $row->course_assignment_id)
            ->first();

        if (!$existingSectionCourse) {
            // Insert missing section_course for new courses
            DB::table('section_courses')->insert([
                'sections_per_program_year_id' => $section->sections_per_program_year_id,
                'course_assignment_id' => $row->course_assignment_id,
                'is_copy' => 0, // Default to original
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Assigns a course to a section and schedule.
     */
    private function assignCourseToSectionAndSchedule($row, $section, &$sections)
    {
        if (is_null($row->course_assignment_id)) {
            return;
        }

        // Find or create the section in the response array
        $sectionIndex = $this->findOrCreateSection($sections, $section);

        // Fetch all section_courses, including duplicates
        $sectionCourses = DB::table('section_courses')
            ->where('sections_per_program_year_id', $section->sections_per_program_year_id)
            ->where('course_assignment_id', $row->course_assignment_id)
            ->get();

        foreach ($sectionCourses as $section_course) {
            $existingSchedule = DB::table('schedules')
                ->where('section_course_id', $section_course->section_course_id)
                ->first();

            if ($existingSchedule) {
                $faculty = $existingSchedule->faculty_id ? DB::table('faculty')
                    ->join('users', 'faculty.user_id', '=', 'users.id')
                    ->where('faculty.id', $existingSchedule->faculty_id)
                    ->select(
                        'faculty.id',
                        'users.id as user_id',
                        'users.email as faculty_email'
                    )
                    ->first() : null;

                // If faculty exists, fetch the user and use the formatted_name
                if ($faculty) {
                    $user = \App\Models\User::find($faculty->user_id);
                    $faculty->professor = $user->formatted_name;
                }

                $room = $existingSchedule->room_id ? DB::table('rooms')
                    ->where('room_id', $existingSchedule->room_id)
                    ->first() : null;

                $scheduleId = $existingSchedule->schedule_id;
            } else {
                $faculty = null;
                $room = null;

                // Insert schedule into the schedules table with null values
                $scheduleId = DB::table('schedules')->insertGetId([
                    'section_course_id' => $section_course->section_course_id,
                    'day' => null,
                    'start_time' => null,
                    'end_time' => null,
                    'faculty_id' => null,
                    'room_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $schedule = DB::table('schedules')
                ->where('section_course_id', $section_course->section_course_id)
                ->first();

            if (!isset($sections[$sectionIndex]['courses'])) {
                $sections[$sectionIndex]['courses'] = [];
            }

            $sections[$sectionIndex]['courses'][] = [
                'course_assignment_id' => $row->course_assignment_id,
                'course_id' => $row->course_id,
                'course_code' => $row->course_code,
                'course_title' => $row->course_title,
                'lec_hours' => $row->lec_hours,
                'lab_hours' => $row->lab_hours,
                'units' => $row->units,
                'tuition_hours' => $row->tuition_hours,
                'schedule' => [
                    'schedule_id' => $scheduleId,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                ],
                'professor' => $faculty ? $faculty->professor : 'Not set',
                'faculty_id' => $faculty ? $faculty->id : null,
                'faculty_email' => $faculty ? $faculty->faculty_email : null,
                'room' => [
                    'room_id' => $room ? $room->room_id : null,
                    'room_code' => $room ? $room->room_code : 'Not set',
                ],
                'is_copy' => $section_course->is_copy,
                'section_course_id' => $section_course->section_course_id,
            ];
        }
    }

    /**
     * Finds or creates a program in the response data.
     */
    private function findOrCreateProgram(&$response, $row)
    {
        $programIndex = array_search($row->program_id, array_column($response, 'program_id'));

        if ($programIndex === false) {
            $response[] = [
                'program_id' => $row->program_id,
                'program_code' => $row->program_code,
                'program_title' => $row->program_title,
                'year_levels' => [],
            ];
            return count($response) - 1;
        }

        return $programIndex;
    }

    /**
     * Finds or creates a year level in the response data.
     */
    private function findOrCreateYearLevel(&$yearLevels, $row)
    {
        foreach ($yearLevels as $index => $yearLevel) {
            if ($yearLevel['year_level'] == $row->year_level && $yearLevel['curriculum_id'] == $row->curriculum_id) {
                return $index;
            }
        }

        $yearLevels[] = [
            'year_level' => $row->year_level,
            'curriculum_id' => $row->curriculum_id,
            'curriculum_year' => $row->curriculum_year,
            'semesters' => [],
        ];
        return count($yearLevels) - 1;
    }

    /**
     * Finds or creates a semester in the response data.
     */
    private function findOrCreateSemester(&$semesters, $row)
    {
        foreach ($semesters as $index => $semester) {
            if ($semester['semester'] == $row->semester) {
                return $index;
            }
        }

        $semesters[] = [
            'semester' => $row->semester,
            'sections' => [],
        ];
        return count($semesters) - 1;
    }

    /**
     * Finds or creates a section in the response data.
     */
    private function findOrCreateSection(&$sections, $section)
    {
        foreach ($sections as $index => $sec) {
            if ($sec['section_per_program_year_id'] == $section->sections_per_program_year_id) {
                return $index;
            }
        }

        $sections[] = [
            'section_per_program_year_id' => $section->sections_per_program_year_id,
            'section_name' => $section->section_name,
            'courses' => [],
        ];

        return count($sections) - 1;
    }
}
