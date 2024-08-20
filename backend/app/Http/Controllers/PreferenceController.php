<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preference;

class PreferenceController extends Controller
{


    public function submitPreference(Request $request)
    {
        $validatedData = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
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
        $preferences = Preference::with(['faculty', 'course'])
            ->get()
            ->groupBy('faculty_id')
            ->map(function ($group) {
                $faculty = $group->first()->faculty;
                return [
                    'faculty_id' => $faculty->id,
                    'faculty_name' => $faculty->name,
                    'faculty_email' => $faculty->faculty_email,
                    'faculty_type' => $faculty->faculty_type,
                    'preferences' => $group->map(function ($preference) {
                        return [
                            'preference_id' => $preference->id,
                            'course_id' => $preference->course_id,
                            'preferred_day' => $preference->preferred_day,
                            'preferred_time' => $preference->preferred_time,
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
