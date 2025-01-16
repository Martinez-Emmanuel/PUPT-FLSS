<?php

namespace App\Http\Controllers;

use App\Models\ActiveSemester;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FacultyNotificationController extends Controller
{
    /**
     * Get notifications and status information for a specific faculty.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFacultyNotifications(Request $request)
    {
        // Validate faculty_id in request
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
        ]);

        $facultyId = $validated['faculty_id'];

        // Get active semester info
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'active_semesters.active_semester_id',
                'active_semesters.academic_year_id',
                'academic_years.year_start',
                'academic_years.year_end',
                'semesters.semester'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

        // Get faculty preferences status and deadlines
        $preferencesSettings = DB::table('preferences_settings')
            ->where('faculty_id', $facultyId)
            ->select(
                'is_enabled',
                'individual_deadline',
                'global_deadline',
                'individual_start_date',
                'global_start_date'
            )
            ->first();

        $preferencesStatus = $preferencesSettings->is_enabled ?? false;
        $preferencesDeadline = $preferencesSettings->individual_deadline ?? $preferencesSettings->global_deadline;
        $preferencesStart = $preferencesSettings->individual_start_date ?? $preferencesSettings->global_start_date;

        // Get faculty schedule publication status
        $isSchedulePublished = DB::table('faculty_schedule_publication')
            ->join('schedules', 'faculty_schedule_publication.schedule_id', '=', 'schedules.schedule_id')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->where('faculty_schedule_publication.faculty_id', $facultyId)
            ->where('sections_per_program_year.academic_year_id', $activeSemester->academic_year_id)
            ->where('faculty_schedule_publication.is_published', 1)
            ->exists();

        return response()->json([
            'academic_year' => "{$activeSemester->year_start}-{$activeSemester->year_end}",
            'semester' => $this->getSemesterLabel($activeSemester->semester),
            'faculty_status' => [
                'preferences_enabled' => (bool) $preferencesStatus,
                'schedule_published' => (bool) $isSchedulePublished,
                'preferences_deadline' => $preferencesDeadline,
                'preferences_start' => $preferencesStart,
            ],
        ]);
    }

    /**
     * Get notifications for faculty access requests.
     */
    public function getRequestNotifications()
    {
        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

        $facultyRequests = Faculty::with(['user'])
            ->join('preferences_settings', 'faculty.id', '=', 'preferences_settings.faculty_id')
            ->where('preferences_settings.has_request', 1)
            ->select(
                'faculty.id as faculty_id',
                'users.first_name',
                'users.middle_name',
                'users.last_name'
            )
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->get();

        $notifications = $facultyRequests->map(function ($faculty) {
            $facultyName = trim(implode(' ', array_filter([
                $faculty->first_name,
                $faculty->last_name,
            ])));

            return [
                'faculty_id' => $faculty->faculty_id,
                'faculty_name' => $facultyName,
            ];
        });

        return response()->json($notifications, 200);
    }

    private function getSemesterLabel($semester): string
    {
        return match ($semester) {
            1 => '1st Semester',
            2 => '2nd Semester',
            3 => 'Summer Semester',
            default => 'Unknown Semester'
        };
    }
}
