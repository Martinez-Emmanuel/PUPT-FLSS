<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;  
use App\Models\Preference;
use App\Models\PreferencesSetting;
use App\Models\ActiveSemester;
class PreferenceController extends Controller
{

    public function submitPreferences(Request $request)
    {
        $validatedData = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
            'active_semester_id' => 'required|exists:active_semesters,active_semester_id',
            'preferences' => 'required|array',
            'preferences.*.course_assignment_id' => 'required|exists:course_assignments,course_assignment_id',
            'preferences.*.preferred_day' => 'required|string',
            'preferences.*.preferred_start_time' => 'required|string',
            'preferences.*.preferred_end_time' => 'required|string',
        ]);
    
        $facultyId = $request->faculty_id;
        $activeSemesterId = $request->active_semester_id;
    
        $existingPreferences = Preference::where('faculty_id', $facultyId)
            ->where('active_semester_id', $activeSemesterId)
            ->get();
    
        $existingIds = $existingPreferences->pluck('course_assignment_id')->toArray();
    
        $newIds = array_column($request->preferences, 'course_assignment_id');
    
        foreach ($request->preferences as $preference) {
            Preference::updateOrCreate(
                [
                    'faculty_id' => $facultyId,
                    'active_semester_id' => $activeSemesterId,
                    'course_assignment_id' => $preference['course_assignment_id'],
                ],
                [
                    'preferred_day' => $preference['preferred_day'],
                    'preferred_start_time' => $preference['preferred_start_time'],
                    'preferred_end_time' => $preference['preferred_end_time'],
                ]
            );
        }
    
        $preferencesToDelete = array_diff($existingIds, $newIds);
        if (!empty($preferencesToDelete)) {
            Preference::where('faculty_id', $facultyId)
                ->where('active_semester_id', $activeSemesterId)
                ->whereIn('course_assignment_id', $preferencesToDelete)
                ->delete();
        }
    
        PreferencesSetting::updateOrCreate(
            ['faculty_id' => $facultyId],
            ['is_enabled' => 0, 'updated_at' => now()]
        );        
    
        return response()->json([
            'message' => 'Preferences submitted successfully'
        ], 201);
    }

    public function deletePreference(Request $request, $preference_id)
    {
        $facultyId = $request->query('faculty_id');
        $activeSemesterId = $request->query('active_semester_id');

        if (!$facultyId) {
            return response()->json(['message' => 'Faculty ID is required.'], 400);
        }

        if (!$activeSemesterId) {
            return response()->json(['message' => 'Active semester ID is required.'], 400);
        }

        $preference = Preference::where('faculty_id', $facultyId)
            ->where('active_semester_id', $activeSemesterId)
            ->where('course_assignment_id', $preference_id)
            ->first();

        if (!$preference) {
            return response()->json(['message' => 'Preference not found.'], 404);
        }

        $preference->delete();

        return response()->json(['message' => 'Preference deleted successfully.'], 200);
    }

    public function deleteAllPreferences(Request $request)
    {
        $facultyId = $request->query('faculty_id');
        $activeSemesterId = $request->query('active_semester_id');

        if (!$facultyId) {
            return response()->json(['message' => 'Faculty ID is required.'], 400);
        }

        if (!$activeSemesterId) {
            return response()->json(['message' => 'Active semester ID is required.'], 400);
        }

        $deletedCount = Preference::where('faculty_id', $facultyId)
            ->where('active_semester_id', $activeSemesterId)
            ->delete();

        if ($deletedCount === 0) {
            return response()->json(['message' => 'No preferences to delete.'], 404);
        }

        return response()->json(['message' => 'All preferences deleted successfully.'], 200);
    }
        

    public function getPreferencesForActiveSemester()
    {
        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();
    
        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }
    
        $preferences = Preference::with([
            'faculty.user', 
            'courseAssignment.course',
            'faculty.preferenceSetting'
        ])
        ->where('active_semester_id', $activeSemester->active_semester_id)
        ->get();
    
        $facultyPreferences = $preferences->groupBy('faculty_id')->map(function ($facultyPreferences) use ($activeSemester) {
            $faculty = $facultyPreferences->first()->faculty; 
            $facultyUser = $faculty->user;
            $preferenceSetting = $faculty->preferenceSetting;
        
            $courses = $facultyPreferences->map(function ($preference) {
                $courseAssignment = $preference->courseAssignment;
                $course = $courseAssignment ? $courseAssignment->course : null;
        
                return [
                    'course_assignment_id' => $courseAssignment->course_assignment_id ?? 'N/A',
                    'course_details' => [
                        'course_id' => $course->course_id ?? 'N/A',
                        'course_code' => $course ? $course->course_code : null,
                        'course_title' => $course ? $course->course_title : null
                    ],
                    'lec_hours' => $course->lec_hours ?? 'N/A',
                    'lab_hours' => $course->lab_hours ?? 'N/A',
                    'units' => $course->units ?? 'N/A',
                    'preferred_day' => $preference->preferred_day,
                    'preferred_start_time' => $preference->preferred_start_time,
                    'preferred_end_time' => $preference->preferred_end_time,
                    'created_at' => $preference->created_at->toDateTimeString(),
                    'updated_at' => $preference->updated_at->toDateTimeString()
                ];
            });
        
            return [
                'faculty_id' => $faculty->id,
                'faculty_name' => $facultyUser->name ?? 'N/A',
                'faculty_code' => $facultyUser->code ?? 'N/A',
                'faculty_units' => $faculty->faculty_units,
                'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 1),
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'courses' => $courses->toArray() 
                    ]
                ]
            ];
        })->values();
        
    
        return response()->json([
            'preferences' => $facultyPreferences
        ], 200, [], JSON_PRETTY_PRINT);
    }


    public function getPreferences()
    {
        $preferences = Preference::with([
            'faculty.user',
            'activeSemester.academicYear',
            'activeSemester.semester',
            'courseAssignment.course' 
        ])->get();
    
        $formattedPreferences = $preferences->groupBy('faculty_id')->mapWithKeys(function ($facultyPreferences, $facultyId) {
            $facultyDetails = $facultyPreferences->first()->faculty->user;
    
            $semesters = $facultyPreferences->groupBy('active_semester_id')->mapWithKeys(function ($semesterPreferences, $activeSemesterId) {
                $semesterDetails = $semesterPreferences->first()->activeSemester;
    
                return [
                    "active_semester_id_{$activeSemesterId}" => [
                        'active_semester_id' => $activeSemesterId,
                        'academic_year_id' => $semesterDetails->academicYear->academic_year_id ?? 'N/A',
                        'academic_year' => $semesterDetails->academicYear->year_start . '-' . $semesterDetails->academicYear->year_end ?? 'N/A',
                        'semester_id' => $semesterDetails->semester->semester_id ?? 'N/A',
                        'courses' => $semesterPreferences->map(function ($preference) {
                            $courseAssignment = $preference->courseAssignment;
                            $course = $courseAssignment->course ?? null;
    
                            return [
                                'course_assignment_id' => $courseAssignment->course_assignment_id ?? 'N/A',
                                'course_details' => [
                                    'course_id' => $course->course_id ?? 'N/A',
                                    'course_code' => $course->course_code ?? 'N/A',
                                    'course_title' => $course->course_title ?? 'N/A',
                                ],
                                'preferred_day' => $preference->preferred_day,
                                'preferred_start_time' => $preference->preferred_start_time,
                                'preferred_end_time' => $preference->preferred_end_time,
                                'created_at' => $preference->created_at->toDateTimeString(),
                                'updated_at' => $preference->updated_at->toDateTimeString()
                            ];
                        })->toArray()
                    ]
                ];
            });
    
            return [
                "faculty_{$facultyId}" => [
                    'faculty_id' => $facultyId,
                    'faculty_name' => $facultyDetails->name ?? 'N/A',
                    'faculty_code' => $facultyDetails->code ?? 'N/A',
                    'faculty_role' => $facultyDetails->role ?? 'N/A',
                    'faculty_status' => $facultyDetails->status ?? 'N/A',
                    'active_semesters' => $semesters
                ]
            ];
        });
    
        return response()->json([
            'preferences' => $formattedPreferences
        ], 200, [], JSON_PRETTY_PRINT);
    }

    
    private function getSemesterLabel($semesterId)
    {
        switch ($semesterId) {
            case 1:
                return '1st Semester';
            case 2:
                return '2nd Semester';
            case 3:
                return 'Summer';
            default:
                return 'Unknown Semester';
        }
    }
    public function findFacultyByCourseCode(Request $request)
    {
        // Validate the incoming request for course_code
        $request->validate([
            'course_code' => 'required|string'
        ]);

        // Find the active semester first
        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();
        
        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

        // Find the course based on the provided course_code
        $course = DB::table('courses')->where('course_code', $request->course_code)->first();

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        // Get preferences based on the course_assignment that matches the course_id and active_semester_id
        $preferences = DB::table('preferences')
            ->join('course_assignments', 'preferences.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('faculty', 'preferences.faculty_id', '=', 'faculty.id')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->where('course_assignments.course_id', $course->course_id)
            ->where('preferences.active_semester_id', $activeSemester->active_semester_id) // Matching active semester
            ->select(
                'faculty.id as faculty_id',
                'users.name as faculty_name',
                'users.code as faculty_code',
                'faculty.faculty_units', // Corrected column name
                'preferences.preferred_day',
                'preferences.preferred_start_time',
                'preferences.preferred_end_time',
                'preferences.created_at', // Use as is
                'preferences.updated_at', // Use as is
                'preferences.course_assignment_id'
            )
            ->get();

        if ($preferences->isEmpty()) {
            return response()->json(['message' => 'No faculty found for this course'], 404);
        }

        // Grouping preferences by faculty for structured output
        $facultyPreferences = $preferences->map(function ($preference) use ($course, $activeSemester) {
            return [
                'faculty_id' => $preference->faculty_id,
                'faculty_name' => $preference->faculty_name,
                'faculty_code' => $preference->faculty_code,
                'faculty_units' => $preference->faculty_units,
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'courses' => [
                            [
                                'course_assignment_id' => $preference->course_assignment_id,
                                'course_details' => [
                                    'course_id' => $course->course_id,
                                    'course_code' => $course->course_code,
                                    'course_title' => $course->course_title,
                                ],
                                'preferred_day' => $preference->preferred_day,
                                'preferred_start_time' => $preference->preferred_start_time,
                                'preferred_end_time' => $preference->preferred_end_time,
                                'created_at' => $preference->created_at,  // Return as is, no toDateTimeString()
                                'updated_at' => $preference->updated_at   // Return as is, no toDateTimeString()
                            ]
                        ]
                    ]
                ]
            ];
        });

        return response()->json([
            'preferences' => $facultyPreferences
        ], 200, [], JSON_PRETTY_PRINT);
    }
        
}
