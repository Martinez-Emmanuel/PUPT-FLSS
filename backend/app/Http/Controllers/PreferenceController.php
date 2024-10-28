<?php

namespace App\Http\Controllers;

use App\Models\ActiveSemester;
use App\Models\Faculty;
use App\Models\Preference;
use App\Models\PreferencesSetting;
use Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'message' => 'Preferences submitted successfully',
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

        // Fetch all faculty and their preferences (if any)
        $faculty = Faculty::with(['user', 'preferenceSetting'])
            ->leftJoin('preferences', function ($join) use ($activeSemester) {
                $join->on('faculty.id', '=', 'preferences.faculty_id')
                    ->where('preferences.active_semester_id', $activeSemester->active_semester_id);
            })
            ->leftJoin('course_assignments', 'preferences.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->leftJoin('courses', 'course_assignments.course_id', '=', 'courses.course_id')
            ->select('faculty.*', 'preferences.*', 'course_assignments.*', 'courses.*')
            ->get();

        $facultyPreferences = $faculty->groupBy('id')->map(function ($facultyGroup) use ($activeSemester) {
            $faculty = $facultyGroup->first();
            $facultyUser = $faculty->user;
            $preferenceSetting = $faculty->preferenceSetting;

            $courses = $facultyGroup->map(function ($preference) {
                if ($preference->course_assignment_id) {
                    return [
                        'course_assignment_id' => $preference->course_assignment_id ?? 'N/A',
                        'course_details' => [
                            'course_id' => $preference->course_id ?? 'N/A',
                            'course_code' => $preference->course_code ?? null,
                            'course_title' => $preference->course_title ?? null,
                        ],
                        'lec_hours' => $preference->lec_hours ?? 'N/A',
                        'lab_hours' => $preference->lab_hours ?? 'N/A',
                        'units' => $preference->units ?? 'N/A',
                        'preferred_day' => $preference->preferred_day,
                        'preferred_start_time' => $preference->preferred_start_time,
                        'preferred_end_time' => $preference->preferred_end_time,
                        // Ensure created_at and updated_at are formatted safely
                        'created_at' => $preference->created_at ? Carbon\Carbon::parse($preference->created_at)->toDateTimeString() : 'N/A',
                        'updated_at' => $preference->updated_at ? Carbon\Carbon::parse($preference->updated_at)->toDateTimeString() : 'N/A',
                    ];
                }
                return [];
            })->filter();

            return [
                'faculty_id' => $faculty->id,
                'faculty_name' => $facultyUser->name ?? 'N/A',
                'faculty_code' => $facultyUser->code ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_units,
                'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 1),
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'courses' => $courses->toArray(),
                    ],
                ],
            ];
        })->values();

        return response()->json([
            'preferences' => $facultyPreferences,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    public function getPreferences()
    {
        $preferences = Preference::with([
            'faculty.user',
            'activeSemester.academicYear',
            'activeSemester.semester',
            'courseAssignment.course',
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
                                'updated_at' => $preference->updated_at->toDateTimeString(),
                            ];
                        })->toArray(),
                    ],
                ];
            });

            return [
                "faculty_{$facultyId}" => [
                    'faculty_id' => $facultyId,
                    'faculty_name' => $facultyDetails->name ?? 'N/A',
                    'faculty_code' => $facultyDetails->code ?? 'N/A',
                    'faculty_role' => $facultyDetails->role ?? 'N/A',
                    'faculty_status' => $facultyDetails->status ?? 'N/A',
                    'active_semesters' => $semesters,
                ],
            ];
        });

        return response()->json([
            'preferences' => $formattedPreferences,
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

        $request->validate([
            'course_code' => 'required|string',
        ]);

        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

        $course = DB::table('courses')->where('course_code', $request->course_code)->first();

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $preferences = DB::table('preferences')
            ->join('course_assignments', 'preferences.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('faculty', 'preferences.faculty_id', '=', 'faculty.id')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->where('course_assignments.course_id', $course->course_id)
            ->where('preferences.active_semester_id', $activeSemester->active_semester_id)
            ->select(
                'faculty.id as faculty_id',
                'users.name as faculty_name',
                'users.code as faculty_code',
                'faculty.faculty_units',
                'preferences.preferred_day',
                'preferences.preferred_start_time',
                'preferences.preferred_end_time',
                'preferences.created_at',
                'preferences.updated_at',
                'preferences.course_assignment_id'
            )
            ->get();

        if ($preferences->isEmpty()) {
            return response()->json(['message' => 'No faculty found for this course'], 404);
        }

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
                                'created_at' => $preference->created_at,
                                'updated_at' => $preference->updated_at,
                            ],
                        ],
                    ],
                ],
            ];
        });

        return response()->json([
            'preferences' => $facultyPreferences,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    public function getPreferencesSetting()
    {
        // Fetch the active semester
        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

        // Fetch all active faculty members from the users table and ensure their preference settings are loaded
        $facultyList = Faculty::with('user', 'preferenceSetting')
            ->whereHas('user', function ($query) {
                $query->where('status', 'Active');
            })
            ->get();

        // Loop through active faculty members and ensure they exist in the preferences_settings table
        foreach ($facultyList as $faculty) {
            // Insert faculty into preferences_settings if not already present
            PreferencesSetting::firstOrCreate(
                ['faculty_id' => $faculty->id],
                ['is_enabled' => 1]// Default value for new entries
            );
        }

        // Refresh the faculty list to include any newly created preference settings
        $facultyList = Faculty::with('user', 'preferenceSetting')
            ->whereHas('user', function ($query) {
                $query->where('status', 'Active');
            })
            ->get();

        // Fetch updated preferences settings for all faculty members
        $facultyPreferences = $facultyList->map(function ($faculty) use ($activeSemester) {
            $preferenceSetting = $faculty->preferenceSetting;

            // Check if the faculty has any preferences for the current active semester
            $preferences = Preference::with(['courseAssignment.course'])
                ->where('faculty_id', $faculty->id)
                ->where('active_semester_id', $activeSemester->active_semester_id)
                ->get();

            // Map courses if preferences exist, otherwise return empty array or N/A values
            $courses = $preferences->map(function ($preference) {
                $courseAssignment = $preference->courseAssignment;
                $course = $courseAssignment ? $courseAssignment->course : null;

                return [
                    'preference_id' => $preference->preferences_id,
                    'course_assignment_id' => $courseAssignment->course_assignment_id ?? 'N/A',
                    'course_details' => [
                        'course_id' => $course->course_id ?? 'N/A',
                        'course_code' => $course ? $course->course_code : null,
                        'course_title' => $course ? $course->course_title : null,
                    ],
                    'lec_hours' => $course->lec_hours ?? 'N/A',
                    'lab_hours' => $course->lab_hours ?? 'N/A',
                    'units' => $course->units ?? 'N/A',
                    'preferred_day' => $preference->preferred_day ?? 'N/A',
                    'preferred_start_time' => $preference->preferred_start_time ?? 'N/A',
                    'preferred_end_time' => $preference->preferred_end_time ?? 'N/A',
                    'created_at' => $preference->created_at ? $preference->created_at->toDateTimeString() : 'N/A',
                    'updated_at' => $preference->updated_at ? $preference->updated_at->toDateTimeString() : 'N/A',
                ];
            });

            // If the faculty has no preferences, return a placeholder or empty collection
            if ($courses->isEmpty()) {
                $courses = collect([[
                    'preference_id' => 'N/A',
                    'course_assignment_id' => 'N/A',
                    'course_details' => [
                        'course_id' => 'N/A',
                        'course_code' => null,
                        'course_title' => null,
                    ],
                    'lec_hours' => 'N/A',
                    'lab_hours' => 'N/A',
                    'units' => 'N/A',
                    'preferred_day' => 'N/A',
                    'preferred_start_time' => 'N/A',
                    'preferred_end_time' => 'N/A',
                    'created_at' => 'N/A',
                    'updated_at' => 'N/A',
                ]]);
            }

            // Return the faculty and their preferences
            return [
                'preferences_settings_id' => $preferenceSetting->preferences_settings_id ?? 'N/A',
                'faculty_id' => $faculty->id,
                'faculty_name' => $faculty->user->name ?? 'N/A',
                'faculty_code' => $faculty->user->code ?? 'N/A',
                'faculty_units' => $faculty->faculty_units ?? 'N/A',
                'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 1),
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'courses' => $courses->toArray(),
                    ],
                ],
            ];
        })->values();

        return response()->json([
            'preferences' => $facultyPreferences,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    public function togglePreferencesSettings(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|boolean',
        ]);

        $facultyList = Faculty::with('user')
            ->whereHas('user', function ($query) {
                $query->where('status', 'Active');
            })
            ->get();

        foreach ($facultyList as $faculty) {
            PreferencesSetting::firstOrCreate(
                ['faculty_id' => $faculty->id],
                ['is_enabled' => $validated['status']]
            );
        }
        PreferencesSetting::query()->update(['is_enabled' => $validated['status']]);

        $updatedPreferencesSettings = PreferencesSetting::all();

        return response()->json([
            'message' => 'All preferences settings updated successfully',
            'status' => $validated['status'],
            'updated_preferences' => $updatedPreferencesSettings,
        ], 200);
    }

    public function toggleSpecificFacultyPreferences(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|integer|exists:faculty,id',
            'status' => 'required|boolean',
        ]);

        $preferenceSetting = PreferencesSetting::firstOrCreate(
            ['faculty_id' => $validated['faculty_id']],
            ['is_enabled' => $validated['status']]
        );

        $preferenceSetting->is_enabled = $validated['status'];
        $preferenceSetting->save();

        return response()->json([
            'message' => 'Preference setting updated successfully for faculty',
            'faculty_id' => $validated['faculty_id'],
            'is_enabled' => $validated['status'],
            'updated_preference' => $preferenceSetting,
        ], 200);
    }

}
