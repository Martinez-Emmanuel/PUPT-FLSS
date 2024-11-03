<?php

namespace App\Http\Controllers;

use App\Models\ActiveSemester;
use App\Models\Faculty;
use App\Models\Preference;
use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PreferenceController extends Controller
{
    /**
     * Submits faculty course preferences and updates existing entries.
     */
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

        // Check if the current date is past the submission deadline
        $facultyId = $validatedData['faculty_id'];
        $activeSemesterId = $validatedData['active_semester_id'];

        // Retrieve preference setting for deadline check
        $preferenceSetting = PreferencesSetting::where('faculty_id', $facultyId)->first();
        $globalDeadline = $preferenceSetting->global_deadline;
        $individualDeadline = $preferenceSetting->individual_deadline;

        $currentDate = Carbon::now();
        $deadline = $individualDeadline ?? $globalDeadline;

        if ($preferenceSetting->is_enabled == 0 || ($deadline && $currentDate->greaterThan(Carbon::parse($deadline)->endOfDay()))) {
            return response()->json([
                'message' => 'The submission deadline has passed. You cannot submit preferences.',
            ], 403);
        }

        // Perform preference submission within a transaction
        DB::transaction(function () use ($validatedData, $facultyId, $activeSemesterId, $request) {
            $existingPreferences = Preference::where('faculty_id', $facultyId)
                ->where('active_semester_id', $activeSemesterId)
                ->get();

            $existingIds = $existingPreferences->pluck('course_assignment_id')->toArray();
            $newIds = array_column($validatedData['preferences'], 'course_assignment_id');

            foreach ($validatedData['preferences'] as $preference) {
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
        });

        return response()->json([
            'message' => 'Preferences submitted successfully',
        ], 201);
    }

    /**
     * Retrieves all faculty preferences for the active year and semester.
     */
    public function getAllFacultyPreferences()
    {
        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

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
                        'created_at' => $preference->created_at ? Carbon::parse($preference->created_at)->toDateTimeString() : 'N/A',
                        'updated_at' => $preference->updated_at ? Carbon::parse($preference->updated_at)->toDateTimeString() : 'N/A',
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
                'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 0),
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'global_deadline' => $preferenceSetting && $preferenceSetting->global_deadline ? Carbon::parse($preferenceSetting->global_deadline)->toDateString() : null,
                        'individual_deadline' => $preferenceSetting && $preferenceSetting->individual_deadline
                        ? Carbon::parse($preferenceSetting->individual_deadline)->toDateString()
                        : ($preferenceSetting && $preferenceSetting->global_deadline ? Carbon::parse($preferenceSetting->global_deadline)->toDateString() : null),

                        'courses' => $courses->toArray(),
                    ],
                ],
            ];
        })->values();

        return response()->json([
            'preferences' => $facultyPreferences,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Retrieves preferences for a specific faculty based on their faculty_id.
     */
    public function getFacultyPreferencesById($faculty_id)
    {
        $activeSemester = ActiveSemester::with(['academicYear', 'semester'])
            ->where('is_active', 1)
            ->first();

        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }

        $faculty = Faculty::where('id', $faculty_id)
            ->with(['user', 'preferenceSetting', 'preferences.courseAssignment.course'])
            ->first();

        if (!$faculty) {
            return response()->json(['error' => 'Faculty not found'], 404);
        }

        $preferenceSetting = $faculty->preferenceSetting;

        $courses = $faculty->preferences->map(function ($preference) {
            return [
                'course_assignment_id' => $preference->course_assignment_id ?? 'N/A',
                'course_details' => [
                    'course_id' => $preference->courseAssignment->course->course_id ?? 'N/A',
                    'course_code' => $preference->courseAssignment->course->course_code ?? null,
                    'course_title' => $preference->courseAssignment->course->course_title ?? null,
                ],
                'lec_hours' => $preference->courseAssignment->course->lec_hours ?? 'N/A',
                'lab_hours' => $preference->courseAssignment->course->lab_hours ?? 'N/A',
                'units' => $preference->courseAssignment->course->units ?? 'N/A',
                'preferred_day' => $preference->preferred_day,
                'preferred_start_time' => $preference->preferred_start_time,
                'preferred_end_time' => $preference->preferred_end_time,
                'created_at' => $preference->created_at ? Carbon::parse($preference->created_at)->toDateTimeString() : 'N/A',
                'updated_at' => $preference->updated_at ? Carbon::parse($preference->updated_at)->toDateTimeString() : 'N/A',
            ];
        });

        $facultyPreference = [
            'faculty_id' => $faculty->id,
            'faculty_name' => $faculty->user->name ?? 'N/A',
            'faculty_code' => $faculty->user->code ?? 'N/A',
            'faculty_type' => $faculty->faculty_type ?? 'N/A',
            'faculty_units' => $faculty->faculty_units,
            'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 0),
            'active_semesters' => [
                [
                    'active_semester_id' => $activeSemester->active_semester_id,
                    'academic_year_id' => $activeSemester->academic_year_id,
                    'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                    'semester_id' => $activeSemester->semester_id,
                    'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                    'global_deadline' => $preferenceSetting && $preferenceSetting->global_deadline ? Carbon::parse($preferenceSetting->global_deadline)->toDateString() : null,
                    'individual_deadline' => $preferenceSetting && $preferenceSetting->individual_deadline ? Carbon::parse($preferenceSetting->individual_deadline)->toDateString() : null,
                    'courses' => $courses->toArray(),
                ],
            ],
        ];

        return response()->json([
            'preferences' => $facultyPreference,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Deletes a specific faculty preference.
     */
    public function deletePreferences(Request $request, $preference_id)
    {
        $facultyId = $request->query('faculty_id');
        $activeSemesterId = $request->query('active_semester_id');

        if (!$facultyId) {
            return response()->json(['message' => 'Faculty ID is required.'], 400);
        }

        if (!$activeSemesterId) {
            return response()->json(['message' => 'Active semester ID is required.'], 400);
        }

        // Check deadline
        $preferenceSetting = PreferencesSetting::where('faculty_id', $facultyId)->first();
        $deadline = $preferenceSetting->individual_deadline ?? $preferenceSetting->global_deadline;

        if ($preferenceSetting->is_enabled == 0 || ($deadline && Carbon::now()->greaterThan(Carbon::parse($deadline)->endOfDay()))) {
            return response()->json([
                'message' => 'The submission deadline has passed. You cannot delete preferences.',
            ], 403);
        }

        // Find and delete the specific preference
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

    /**
     * Deletes all preferences for a specific faculty and semester.
     */
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

        // Check deadline
        $preferenceSetting = PreferencesSetting::where('faculty_id', $facultyId)->first();
        $deadline = $preferenceSetting->individual_deadline ?? $preferenceSetting->global_deadline;

        if ($preferenceSetting->is_enabled == 0 || ($deadline && Carbon::now()->greaterThan(Carbon::parse($deadline)->endOfDay()))) {
            return response()->json([
                'message' => 'The submission deadline has passed or preferences modification is disabled. You cannot delete all preferences.',
            ], 403);
        }

        // Delete all preferences for the specified faculty and semester
        DB::transaction(function () use ($facultyId, $activeSemesterId) {
            Preference::where('faculty_id', $facultyId)
                ->where('active_semester_id', $activeSemesterId)
                ->delete();
        });

        return response()->json(['message' => 'All preferences deleted successfully.'], 200);
    }

    /**
     * Toggles preference settings globally for all faculty members.
     */
    public function toggleAllPreferences(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|boolean',
            'global_deadline' => 'nullable|date|after:today',
        ]);

        DB::transaction(function () use ($validated) {
            $status = $validated['status'];
            $global_deadline = $status ? $validated['global_deadline'] : null;

            $facultySettings = PreferencesSetting::all();

            foreach ($facultySettings as $setting) {
                $setting->is_enabled = $status;
                $setting->global_deadline = $global_deadline;
                $setting->individual_deadline = null;
                $setting->save();
            }

            $facultyWithoutSettings = Faculty::whereDoesntHave('preferenceSetting')->get();
            foreach ($facultyWithoutSettings as $faculty) {
                PreferencesSetting::create([
                    'faculty_id' => $faculty->id,
                    'is_enabled' => $status,
                    'global_deadline' => $global_deadline,
                    'individual_deadline' => null,
                ]);
            }
        });

        return response()->json([
            'message' => 'All preferences settings updated successfully',
            'status' => $validated['status'],
            'global_deadline' => $validated['global_deadline'],
            'updated_preferences' => PreferencesSetting::all(),
        ], 200);
    }

    /**
     * Toggles preference settings for a single faculty member.
     */
    public function toggleSinglePreferences(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|integer|exists:faculty,id',
            'status' => 'required|boolean',
            'individual_deadline' => 'nullable|date|after:today',
        ]);

        DB::transaction(function () use ($validated) {
            $faculty_id = $validated['faculty_id'];
            $status = $validated['status'];
            $individual_deadline = $status ? $validated['individual_deadline'] : null;

            $preferenceSetting = PreferencesSetting::firstOrCreate(
                ['faculty_id' => $faculty_id],
                ['is_enabled' => 0, 'global_deadline' => null, 'individual_deadline' => null]
            );

            $preferenceSetting->is_enabled = $status;
            $preferenceSetting->individual_deadline = $individual_deadline;
            $preferenceSetting->global_deadline = null;
            $preferenceSetting->save();
        });

        return response()->json([
            'message' => 'Preference setting updated successfully for faculty',
            'faculty_id' => $validated['faculty_id'],
            'is_enabled' => $validated['status'],
            'individual_deadline' => $validated['individual_deadline'],
            'updated_preference' => PreferencesSetting::find($validated['faculty_id']),
        ], 200);
    }

    /**
     * Gets a readable label for a semester based on its ID.
     */
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
