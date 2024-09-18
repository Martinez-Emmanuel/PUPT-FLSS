<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preference;
use Illuminate\Support\Facades\DB;  
class PreferenceController extends Controller
{

    public function submitPreference(Request $request)
    {
        $validatedData = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
            'academic_year_id' => 'required|exists:academic_years,academic_year_id',
            'semester_id' => 'required|exists:active_semesters,semester_id',
            'preferences' => 'required|array',
            'preferences.*.course_id' => 'required|exists:courses,course_id',
            'preferences.*.preferred_day' => 'required|string',
            'preferences.*.preferred_time' => 'required|string',
        ]);
    
        foreach ($request->preferences as $preference) {
            Preference::create([
                'faculty_id' => $request->faculty_id,               
                'academic_year_id' => $request->academic_year_id,   
                'semester_id' => $request->semester_id,            
                'course_id' => $preference['course_id'],         
                'preferred_day' => $preference['preferred_day'],    
                'preferred_time' => $preference['preferred_time'], 
            ]);
        }
    
        return response()->json([
            'message' => 'Preferences submitted successfully'
        ], 201);
    }
    

    public function getPreferencesForActiveSemester()
    {
        // Get the active semester from the active_semesters table
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();
    
        // If no active semester is found, return an error message
        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }
    

        $preferences = Preference::with([
            'faculty.user',    
            'academicYear',    
            'course'           
        ])
        ->where('academic_year_id', $activeSemester->academic_year_id)
        ->where('semester_id', $activeSemester->semester_id)
        ->get();
    
        // Restructure the preferences to remove redundancy
        $groupedPreferences = $preferences->groupBy('faculty_id')->map(function ($facultyPreferences) use ($activeSemester) {
            $faculty = $facultyPreferences->first()->faculty;
            return [
                'faculty_id' => $faculty->id,
                'faculty_name' => $faculty->user->name ?? 'N/A',
                'faculty_code' => $faculty->user->code ?? 'N/A',
                'faculty_role' => $faculty->user->role ?? 'N/A',
                'faculty_status' => $faculty->user->status ?? 'N/A',
                'academic_year_id' => $activeSemester->academic_year_id,
                'semester' => [
                    'semester_label' => $this->getSemesterLabel($activeSemester->semester_id), 
                    'semester_id' => $activeSemester->semester_id,
                    'courses' => $facultyPreferences->map(function ($preference) {
                        return [
                            'course_details' => [
                                'course_id' => $preference->course->course_id,
                                'course_code' => $preference->course->course_code,
                                'course_title' => $preference->course->course_title
                            ],
                            'preferred_day' => $preference->preferred_day,
                            'preferred_time' => $preference->preferred_time,
                            'created_at' => $preference->created_at->toDateTimeString(),
                            'updated_at' => $preference->updated_at->toDateTimeString()
                        ];
                    })
                ]
            ];
        });
    
        return response()->json([
            'active_semester_id' => $activeSemester->active_semester_id,
            'academic_year_id' => $activeSemester->academic_year_id,
            'semester_id' => $activeSemester->semester_id,
            'preferences' => $groupedPreferences
        ]);
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
