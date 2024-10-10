<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Mail\PreferencesSubmitted;
use App\Models\ActiveSemester;
class FacultyController extends Controller
{
    public function getFaculty()
    {
        return response()->json(Faculty::all(), 200);
    }

    public function sendEmails()
    {
        $faculties = Faculty::all();

        foreach ($faculties as $faculty) {
            $this->sendEmail($faculty);
        }

        return response()->json(['message' => 'Emails sent successfully'], 200);
    }

    protected function sendEmail($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name, 
            'email' => $faculty->faculty_email,
            'faculty_units' => $faculty->faculty_units,
        ];

        Mail::send('emails.faculty_notification', $data, function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Set and Submit Your Subject Preference');
        });
    }

    public function testEmail()
    {
        $data = [
            'faculty_name' => 'Juan Dela Cruz',
            'faculty_units' => '30', 
        ];

        return view('emails.faculty_notification', $data);
    }

    public function sendPreferencesSubmittedEmail(Request $request)
    {
        $facultyId = $request->input('faculty_id');
    
        $faculty = Faculty::find($facultyId);
    
        if ($faculty) {
            $this->sendPreferencesSubmittedNotification($faculty);
            return response()->json(['message' => 'Preferences submission notification sent successfully'], 200);
        } else {
            return response()->json(['message' => 'Faculty not found'], 404);
        }
    }
    

    protected function sendPreferencesSubmittedNotification($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.preferences_submitted', $data, function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Your Preferences Have Been Submitted and Are Under Review');
        });
    }

    public function sendSubjectsScheduleSetEmail(Request $request)
    {
        $facultyId = $request->input('faculty_id');

        $faculty = Faculty::find($facultyId);

        if ($faculty) {
            $this->sendSubjectsScheduleSetNotification($faculty);
            return response()->json(['message' => 'Subjects, load, and schedule set notification sent successfully'], 200);
        } else {
            return response()->json(['message' => 'Faculty not found'], 404);
        }
    }

    protected function sendSubjectsScheduleSetNotification($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.subjects_schedule_set', $data, function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Your Subjects, Load, and Schedule Have Been Set');
        });
    }

    public function getIndividualFacultySchedule(Request $request)
    {
        // Step 1: Validate the input to ensure faculty_id is provided
        $request->validate([
            'faculty_id' => 'required|integer|exists:faculty,id',
        ]);
    
        $facultyId = $request->input('faculty_id');
    
        // Step 2: Retrieve the current active semester with academic year details
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
    
        // Step 3: Check if the schedule is published for this faculty
        $publicationStatus = DB::table('faculty_schedule_publication')
            ->where('faculty_id', $facultyId)
            ->where('is_published', 1)
            ->exists();
    
        if (!$publicationStatus) {
            return response()->json([
                'message' => 'Schedules are still being prepared. Please wait while they are being finalized.'
            ], 200);
        }
    
        // Step 4: Fetch the faculty information
        $faculty = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->where('faculty.id', $facultyId)
            ->select(
                'faculty.id as faculty_id',
                'users.name as faculty_name',
                'faculty.faculty_type',
                DB::raw('0 as assigned_units'),
                DB::raw('0 as is_published')
            )
            ->first();
    
        if (!$faculty) {
            return response()->json(['message' => 'Faculty not found'], 404);
        }
    
        // Step 5: Get the schedules for the specific faculty
        $facultySchedules = $this->getFacultySchedules($faculty->faculty_id, $activeSemester);
    
        // Step 6: Prepare the response structure
        $response = [
            'faculty_schedule_report' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester_id,
                'faculty' => [
                    'faculty_id' => $faculty->faculty_id,
                    'faculty_name' => $faculty->faculty_name,
                    'faculty_type' => $faculty->faculty_type,
                    'schedules' => $facultySchedules
                ]
            ]
        ];
    
        return response()->json($response);
    }
    

    private function getFacultySchedules($facultyId, $activeSemester)
    {
        $schedules = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('courses', 'course_assignments.course_id', '=', 'courses.course_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('programs', 'sections_per_program_year.program_id', '=', 'programs.program_id')
            ->leftJoin('rooms', 'schedules.room_id', '=', 'rooms.room_id') // Use leftJoin to allow null room values
            ->join('semesters as s', 'course_assignments.semester_id', '=', 's.semester_id')
            ->where('schedules.faculty_id', $facultyId)
            ->where('s.semester', $activeSemester->semester_id)
            ->where('sections_per_program_year.academic_year_id', $activeSemester->academic_year_id)
            ->select(
                'programs.program_id',
                'programs.program_code',
                'programs.program_title',
                'sections_per_program_year.year_level',
                'sections_per_program_year.sections_per_program_year_id',
                'sections_per_program_year.section_name',
                'schedules.schedule_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'rooms.room_code',
                'course_assignments.course_assignment_id',
                'courses.course_title',
                'courses.course_code',
                'courses.lec_hours as lec',
                'courses.lab_hours as lab',
                'courses.units',
                'courses.tuition_hours',
                's.semester_id'
            )
            ->get();
    
        $organizedSchedules = [];
    
        foreach ($schedules as $schedule) {
            $programIndex = $this->findOrCreateProgram($organizedSchedules, $schedule);
            $yearLevelIndex = $this->findOrCreateYearLevel($organizedSchedules[$programIndex]['year_levels'], $schedule);
            $semesterIndex = $this->findOrCreateSemester($organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'], $schedule->semester_id);
            $sectionIndex = $this->findOrCreateSection($organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'], $schedule);
    
            // Ensure N/A values for potentially missing fields
            $startTime = $schedule->start_time ?? 'N/A';
            $endTime = $schedule->end_time ?? 'N/A';
            $roomCode = $schedule->room_code ?? 'N/A';
    
            if (!isset($organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'][$sectionIndex]['courses'][$schedule->day])) {
                $organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'][$sectionIndex]['courses'][$schedule->day] = [];
            }
    
            $organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'][$sectionIndex]['courses'][$schedule->day][] = [
                'schedule_id' => $schedule->schedule_id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'room_code' => $roomCode,
                'course_details' => [
                    'course_assignment_id' => $schedule->course_assignment_id ?? 'N/A',
                    'course_title' => $schedule->course_title ?? 'N/A',
                    'course_code' => $schedule->course_code ?? 'N/A',
                    'lec' => $schedule->lec ?? 0,
                    'lab' => $schedule->lab ?? 0,
                    'units' => $schedule->units ?? 0,
                    'tuition_hours' => $schedule->tuition_hours ?? 0
                ]
            ];
        }
    
        return array_values($organizedSchedules);
    }
    

    private function findOrCreateProgram(&$programs, $schedule)
    {
        foreach ($programs as $index => $program) {
            if ($program['program_id'] == $schedule->program_id) {
                return $index;
            }
        }

        $programs[] = [
            'program_id' => $schedule->program_id,
            'program_code' => $schedule->program_code,
            'program_title' => $schedule->program_title,
            'year_levels' => []
        ];

        return count($programs) - 1;
    }

    private function findOrCreateYearLevel(&$yearLevels, $schedule)
    {
        foreach ($yearLevels as $index => $yearLevel) {
            if ($yearLevel['year_level'] == $schedule->year_level) {
                return $index;
            }
        }

        $yearLevels[] = [
            'year_level' => $schedule->year_level,
            'semesters' => []
        ];

        return count($yearLevels) - 1;
    }

    private function findOrCreateSemester(&$semesters, $semesterId)
    {
        foreach ($semesters as $index => $semester) {
            if ($semester['semester'] == $semesterId) {
                return $index;
            }
        }

        $semesters[] = [
            'semester' => $semesterId,
            'sections' => []
        ];

        return count($semesters) - 1;
    }

    private function findOrCreateSection(&$sections, $schedule)
    {
        foreach ($sections as $index => $section) {
            if ($section['section_per_program_year_id'] == $schedule->sections_per_program_year_id) {
                return $index;
            }
        }

        $sections[] = [
            'section_per_program_year_id' => $schedule->sections_per_program_year_id,
            'section_name' => $schedule->section_name,
            'courses' => []
        ];

        return count($sections) - 1;
    }
    
}
