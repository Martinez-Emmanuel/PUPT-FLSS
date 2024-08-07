<?php

namespace App\Http\Controllers;

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preference;

class PreferenceController extends Controller
{
    public function submitPreference(Request $request)
    {
        $validatedData = $request->validate([
            'faculty_id' => 'required|exists:faculties,faculty_id',
            'preferences' => 'required|array',
            'preferences.*.course_id' => 'required|exists:courses,course_id',
            'preferences.*.preferred_day' => 'required|string',
            'preferences.*.preferred_time' => 'required|string',
        ]);

        foreach ($request->preferences as $preference) {
            Preference::create([
                'faculty_id' => $request->faculty_id,
                'course_id' => $preference['course_id'],
                'preferred_day' => $preference['preferred_day'],
                'preferred_time' => $preference['preferred_time'],
            ]);
        }

        return response()->json([
            'message' => 'Preferences submitted successfully'
        ], 201);
    }
    public function getAllSubmittedPreferences()
    {
        // Get all preferences with faculty and course details
        $preferences = Preference::with(['faculty', 'course'])
            ->get()
            ->groupBy('faculty_id')
            ->map(function($group) {
                $faculty = $group->first()->faculty;
                return [
                    'faculty_id' => $faculty->faculty_id,
                    'faculty_name' => $faculty->faculty_name,
                    'faculty_code' => $faculty->faculty_code,
                    'faculty_email' => $faculty->faculty_email,
                    'faculty_type' => $faculty->faculty_type,
                    'preferences' => $group->map(function($preference) {
                        return [
                            'preference_id' => $preference->preference_id,
                            'course_id' => $preference->course_id,
                            'subject_code' => $preference->course->subject_code,
                            'subject_title' => $preference->course->subject_title,
                            'lec_hours' => $preference->course->lec_hours,
                            'lab_hours' => $preference->course->lab_hours,
                            'total_units' => $preference->course->total_units,
                            'preferred_day' => $preference->preferred_day,
                            'preferred_time' => $preference->preferred_time,
                            'created_at' => $preference->created_at,
                            'updated_at' => $preference->updated_at,
                        ];
                    }),
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Preferences retrieved successfully',
            'faculties' => $preferences
        ], 200);
    }
}

