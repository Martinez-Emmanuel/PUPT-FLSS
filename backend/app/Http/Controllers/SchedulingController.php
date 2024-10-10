<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use App\Models\Schedule;
use App\Models\FacultySchedulePublication;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SchedulingController extends Controller
{
    public function getFacultyDetails()
    {
        $facultyDetails = Faculty::whereHas('user', function ($query) {
            $query->where('status', 'Active');
        })->with('user')->get();
    
        $response = $facultyDetails->map(function ($faculty) {
            return [
                'faculty_id' => $faculty->id,
                'name' => $faculty->user->name ?? 'N/A',
                'code' => $faculty->user->code ?? 'N/A',
                'faculty_email' => $faculty->faculty_email ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_units ?? 'N/A',
            ];
        });
    
        return response()->json(['faculty' => $response], 200);
    }

    
    public function assignSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id'  => 'required|exists:schedules,schedule_id',
            'faculty_id'   => 'nullable|exists:faculty,id',
            'room_id'      => 'nullable|exists:rooms,room_id',
            'day'          => 'nullable|string|max:10',
            'start_time'   => 'nullable|date_format:H:i:s',
            'end_time'     => 'nullable|date_format:H:i:s|after:start_time',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors'  => $validator->errors()
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
    
            $schedule->faculty_id  = $request->input('faculty_id');
            $schedule->room_id     = $request->input('room_id');   
            $schedule->day         = $request->input('day');       
            $schedule->start_time  = $request->input('start_time');
            $schedule->end_time    = $request->input('end_time');
            
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
                        'schedule_id' => $schedule->schedule_id
                    ],
                    [
                        'is_published' => 0,
                    ]
                );
            }
    
            elseif ($previousFacultyId) {
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
                    'schedule_id'    => $schedule->schedule_id,
                    'section_course_id' => $schedule->section_course_id,
                    'day'            => $schedule->day,
                    'start_time'     => $schedule->start_time,
                    'end_time'       => $schedule->end_time,
                    'faculty'        => $schedule->faculty ? [
                        'faculty_id'     => $schedule->faculty->id,
                        'name'           => $schedule->faculty->user->name,
                        'email'          => $schedule->faculty->faculty_email,
                    ] : null,
                    'room'           => $schedule->room ? [
                        'room_id'        => $schedule->room->room_id,
                        'room_code'      => $schedule->room->room_code,
                    ] : null,
                    'created_at'     => $schedule->created_at,
                    'updated_at'     => $schedule->updated_at,
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

    public function togglePublishSchedules(Request $request)
    {
        // Step 1: Get the active semester and academic year
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();
    
        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 404);
        }
    
        $activeAcademicYearId = $activeSemester->academic_year_id;
        $activeSemesterId = $activeSemester->semester_id;
    
        // Step 2: Define the new `is_published` value (toggle between 0 and 1)
        $isPublished = $request->input('is_published'); 
    
        // Step 3: Fetch schedule IDs for the active semester and academic year
        $activeSchedules = DB::table('schedules')
            ->select('schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters', 'course_assignments.semester_id', '=', 'semesters.semester_id')
            ->where('sections_per_program_year.academic_year_id', $activeAcademicYearId)
            ->where('semesters.semester', $activeSemesterId)
            ->pluck('schedules.schedule_id'); // Using `pluck` to get an array of schedule IDs
    
        // Step 4: Set `is_published` to 0 for all schedules not in the active academic year and semester
        DB::table('schedules')
            ->whereNotIn('schedule_id', $activeSchedules)
            ->update(['is_published' => 0]);
    
        // Step 5: Set `is_published` to 0 for all entries in `faculty_schedule_publication` not in the active academic year and semester
        DB::table('faculty_schedule_publication')
            ->whereNotIn('schedule_id', $activeSchedules)
            ->update(['is_published' => 0]);
    
        // Step 6: Update `is_published` for the fetched schedules in the `schedules` table
        $updatedCount = DB::table('schedules')
            ->whereIn('schedule_id', $activeSchedules)
            ->update(['is_published' => $isPublished]);
    
        // Step 7: Update `is_published` in the `faculty_schedule_publication` table based on the same schedule IDs
        DB::table('faculty_schedule_publication')
            ->whereIn('schedule_id', $activeSchedules)
            ->update(['is_published' => $isPublished]);
    
        // Step 8: Return a response
        return response()->json([
            'message' => 'Schedules and faculty schedule publications updated successfully',
            'updated_count' => $updatedCount,
            'is_published' => $isPublished,
            'active_semester_id' => $activeSemester->active_semester_id,
            'academic_year_id' => $activeAcademicYearId,
            'semester_id' => $activeSemesterId
        ]);
    }
    


    public function toggleIndividualSchedule(Request $request)
    {
        // Step 1: Validate the input
        $request->validate([
            'faculty_id' => 'required|integer|exists:faculty_schedule_publication,faculty_id',
            'is_published' => 'required|boolean'
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

        // Step 3: Set `is_published` to 0 for all schedules not in the active semester and academic year
        // This will ensure that schedules from previous semesters or academic years are deactivated.
        DB::table('faculty_schedule_publication')
            ->join('schedules', 'faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters', 'course_assignments.semester_id', '=', 'semesters.semester_id')
            ->where('faculty_schedule_publication.faculty_id', $facultyId)
            ->where(function ($query) use ($activeAcademicYearId, $activeSemesterId) {
                $query->where('sections_per_program_year.academic_year_id', '<>', $activeAcademicYearId)
                    ->orWhere('semesters.semester', '<>', $activeSemesterId);
            })
            ->update(['faculty_schedule_publication.is_published' => 0, 'schedules.is_published' => 0, 'faculty_schedule_publication.updated_at' => now(), 'schedules.updated_at' => now()]);

        // Step 4: Fetch all related schedule_ids from the faculty_schedule_publication table
        // Only for schedules that match the active academic year and semester
        $facultySchedules = DB::table('faculty_schedule_publication')
            ->join('schedules', 'faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters', 'course_assignments.semester_id', '=', 'semesters.semester_id')
            ->where('faculty_schedule_publication.faculty_id', $facultyId)
            ->where('sections_per_program_year.academic_year_id', $activeAcademicYearId)
            ->where('semesters.semester', $activeSemesterId)
            ->pluck('schedules.schedule_id', 'faculty_schedule_publication.faculty_schedule_publication_id');

        if ($facultySchedules->isEmpty()) {
            return response()->json(['message' => 'No schedules found for the given faculty in the active semester and academic year'], 404);
        }

        // Step 5: Update the is_published value in the faculty_schedule_publication table for active schedules
        DB::table('faculty_schedule_publication')
            ->whereIn('faculty_schedule_publication_id', $facultySchedules->keys())
            ->update(['is_published' => $isPublished, 'updated_at' => now()]);

        // Step 6: Update the corresponding is_published value in the schedules table for active schedules
        DB::table('schedules')
            ->whereIn('schedule_id', $facultySchedules->values())
            ->update(['is_published' => $isPublished, 'updated_at' => now()]);

        // Step 7: Return a success response
        return response()->json([
            'message' => 'Publication status updated successfully for the faculty',
            'faculty_id' => $facultyId,
            'is_published' => $isPublished,
            'updated_schedule_ids' => $facultySchedules->values()
        ]);
    }


    public function getActiveSchedulesByCourseAssignment()
    {
        // Step 1: Get the active semester and academic year
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 404);
        }

        $activeAcademicYearId = $activeSemester->academic_year_id;
        $activeSemesterId = $activeSemester->semester_id;

        // Step 2: Fetch schedule IDs using course_assignment_id through section_courses
        $activeSchedules = DB::table('schedules')
            ->select('schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('semesters', 'course_assignments.semester_id', '=', 'semesters.semester_id')
            ->where('sections_per_program_year.academic_year_id', $activeAcademicYearId)
            ->where('semesters.semester', $activeSemesterId)
            ->get();

        // Step 3: Return the result as a JSON response
        return response()->json([
            'message' => 'Active schedules fetched successfully',
            'active_semester_id' => $activeSemester->active_semester_id,
            'academic_year_id' => $activeAcademicYearId,
            'semester_id' => $activeSemesterId,
            'schedule_ids' => $activeSchedules
        ]);
    }
 
}

