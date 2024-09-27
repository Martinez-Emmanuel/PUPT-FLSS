<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preference;
use Illuminate\Support\Facades\DB;  
use App\Models\ActiveSemester;
class PreferenceController extends Controller
{

    public function submitPreference(Request $request)
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
    
        foreach ($request->preferences as $preference) {
            Preference::create([
                'faculty_id' => $request->faculty_id,
                'active_semester_id' => $request->active_semester_id,
                'course_assignment_id' => $preference['course_assignment_id'],
                'preferred_day' => $preference['preferred_day'],
                'preferred_start_time' => $preference['preferred_start_time'],
                'preferred_end_time' => $preference['preferred_end_time'],
            ]);
        }
    
        return response()->json([
            'message' => 'Preferences submitted successfully'
        ], 201);
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
            'courseAssignment.course'
        ])
        ->where('active_semester_id', $activeSemester->active_semester_id)
        ->get();
    
        $facultyPreferences = $preferences->groupBy('faculty_id')->map(function ($facultyPreferences) use ($activeSemester) {
            $faculty = $facultyPreferences->first()->faculty; 
            $facultyUser = $faculty->user;
    
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
    
        // Return the structured response
        return response()->json([
            'preferences' => $facultyPreferences
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
    
}
