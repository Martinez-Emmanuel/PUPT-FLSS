<?php

namespace App\Http\Controllers;

use App\Jobs\SendFacultyPreferenceEmailJob;
use App\Models\ActiveSemester;
use App\Models\Faculty;
use App\Models\FacultyNotification;
use App\Models\Preference;
use App\Models\PreferenceDay;
use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PreferenceController extends Controller
{
    /**
     * Submits a single faculty preference and updates existing entries.
     */
    public function submitPreferences(Request $request)
    {
        $validatedData = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
            'active_semester_id' => 'required|exists:active_semesters,active_semester_id',
            'course_assignment_id' => 'required|exists:course_assignments,course_assignment_id',
            'preferred_days' => 'required|array',
            'preferred_days.*.day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'preferred_days.*.start_time' => 'required|date_format:H:i:s',
            'preferred_days.*.end_time' => 'required|date_format:H:i:s',
        ]);

        $facultyId = $validatedData['faculty_id'];
        $activeSemesterId = $validatedData['active_semester_id'];
        $courseAssignmentId = $validatedData['course_assignment_id'];

        $preferenceSetting = PreferencesSetting::where('faculty_id', $facultyId)->first();
        $globalDeadline = $preferenceSetting->global_deadline;
        $individualDeadline = $preferenceSetting->individual_deadline;

        $currentDate = Carbon::now();
        $deadline = $individualDeadline ?? $globalDeadline;

        if ($preferenceSetting->is_enabled == 0 || ($deadline && $currentDate->greaterThan(Carbon::parse($deadline)->endOfDay()))) {
            return response()->json([
                'message' => 'Submission is now closed. You cannot submit preferences anymore.',
            ], 403);
        }

        DB::transaction(function () use ($validatedData, $facultyId, $activeSemesterId, $courseAssignmentId) {
            $preference = Preference::updateOrCreate(
                [
                    'faculty_id' => $facultyId,
                    'active_semester_id' => $activeSemesterId,
                    'course_assignment_id' => $courseAssignmentId,
                ],
                []
            );

            // Check if preferred days have changed
            $existingDays = PreferenceDay::where('preference_id', $preference->preferences_id)
                ->orderBy('preferred_day')
                ->get()
                ->map(function ($day) {
                    return [
                        'day' => $day->preferred_day,
                        'start_time' => $day->preferred_start_time,
                        'end_time' => $day->preferred_end_time,
                    ];
                })->toArray();

            $newDays = $validatedData['preferred_days'];
            usort($newDays, function ($a, $b) {
                return $a['day'] <=> $b['day'];
            });

            if ($existingDays !== $newDays) {
                // Delete existing days for this preference
                PreferenceDay::where('preference_id', $preference->preferences_id)->delete();

                // Create new preference days with start and end times
                foreach ($newDays as $dayData) {
                    PreferenceDay::create([
                        'preference_id' => $preference->preferences_id,
                        'preferred_day' => $dayData['day'],
                        'preferred_start_time' => $dayData['start_time'],
                        'preferred_end_time' => $dayData['end_time'],
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Preference submitted successfully',
        ], 201);
    }

    /**
     * Retrieves all unique faculty preferences for the active year and semester.
     * In this context, 'unique' means it returns only one instance of a course,
     * a.k.a. the actual selected preference of the faculty
     */
    public function getUniqueFacultyPreferences()
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
            ->select('faculty.*', 'preferences.preferences_id', 'course_assignments.*', 'courses.*') // Select necessary columns
            ->get();

        $facultyPreferences = $faculty->groupBy('id')->map(function ($facultyGroup) use ($activeSemester) {
            $faculty = $facultyGroup->first();
            $facultyUser = $faculty->user;
            $preferenceSetting = $faculty->preferenceSetting;

            $courses = $facultyGroup->map(function ($preference) {
                if ($preference->course_assignment_id) {
                    $preferenceDays = PreferenceDay::where('preference_id', $preference->preferences_id)
                        ->orderBy('preferred_day')
                        ->get()
                        ->map(function ($day) {
                            return [
                                'day' => $day->preferred_day,
                                'start_time' => $day->preferred_start_time,
                                'end_time' => $day->preferred_end_time,
                            ];
                        })->values()->toArray();

                    return [
                        'course_assignment_id' => $preference->course_assignment_id ?? 'N/A',
                        'course_details' => [
                            'course_id' => $preference->course_id ?? 'N/A',
                            'course_code' => $preference->course_code ?? null,
                            'course_title' => $preference->course_title ?? null,
                        ],
                        'lec_hours' => is_numeric($preference->lec_hours) ? (int) $preference->lec_hours : 0,
                        'lab_hours' => is_numeric($preference->lab_hours) ? (int) $preference->lab_hours : 0,
                        'units' => $preference->units ?? 0,
                        'preferred_days' => $preferenceDays,
                        'created_at' => $preference->created_at ? Carbon::parse($preference->created_at)->toDateTimeString() : 'N/A',
                        'updated_at' => $preference->updated_at ? Carbon::parse($preference->updated_at)->toDateTimeString() : 'N/A',
                    ];
                }
                return [];
            })->filter();

            return [
                'faculty_id' => $faculty->id,
                'faculty_name' => $facultyUser->formatted_name ?? 'N/A',
                'faculty_code' => $facultyUser->code ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_units,
                'has_request' => (int) ($preferenceSetting->has_request ?? 0),
                'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 0),
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'global_start_date' => $preferenceSetting && $preferenceSetting->global_start_date
                        ? Carbon::parse($preferenceSetting->global_start_date)->toDateString() : null,
                        'individual_start_date' => $preferenceSetting && $preferenceSetting->individual_start_date
                        ? Carbon::parse($preferenceSetting->individual_start_date)->toDateString() : null,
                        'global_deadline' => $preferenceSetting && $preferenceSetting->global_deadline
                        ? Carbon::parse($preferenceSetting->global_deadline)->toDateString() : null,
                        'individual_deadline' => $preferenceSetting && $preferenceSetting->individual_deadline
                        ? Carbon::parse($preferenceSetting->individual_deadline)->toDateString() : null,
                        'courses' => $courses->toArray(),
                    ],
                ],
            ];
        })
        // Sort by 'has_request' first (descending),
        // and then by 'faculty_name' alphabetically
            ->sort(function ($a, $b) {
                if ($a['has_request'] !== $b['has_request']) {
                    return $b['has_request'] <=> $a['has_request'];
                }
                return strcmp($a['faculty_name'], $b['faculty_name']);
            })
            ->values();

        return response()->json([
            'preferences' => $facultyPreferences,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Retrieves all faculty preferences for the active year and semester.
     * This returns ALL the instances of a selected course across all programs
     * in all active curricula.
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

            $courses = $facultyGroup->flatMap(function ($preference) use ($activeSemester) {
                if ($preference->course_assignment_id) {
                    $preferenceDays = PreferenceDay::where('preference_id', $preference->preferences_id)
                        ->orderBy('preferred_day')
                        ->get()
                        ->map(function ($day) {
                            return [
                                'day' => $day->preferred_day,
                                'start_time' => $day->preferred_start_time,
                                'end_time' => $day->preferred_end_time,
                            ];
                        })->values()->toArray();

                    // Fetch all courses with the same course code OR course title that are active
                    $relatedCourses = DB::table('courses')
                        ->join('course_assignments', 'courses.course_id', '=', 'course_assignments.course_id')
                        ->where(function ($query) use ($preference) {
                            $query->where('courses.course_code', $preference->course_code)
                                ->orWhere('courses.course_title', $preference->course_title);
                        })
                        ->whereIn('course_assignments.curricula_program_id', function ($query) {
                            $query->select('curricula_program_id')
                                ->from('curricula_program')
                                ->join('curricula', 'curricula_program.curriculum_id', '=', 'curricula.curriculum_id')
                                ->where('curricula.status', 'Active');
                        })
                        ->get();

                    return $relatedCourses->map(function ($course) use ($preference, $preferenceDays) {
                        return [
                            'course_assignment_id' => $course->course_assignment_id ?? 'N/A',
                            'course_details' => [
                                'course_id' => $course->course_id ?? 'N/A',
                                'course_code' => $course->course_code ?? null,
                                'course_title' => $course->course_title ?? null,
                            ],
                            'lec_hours' => is_numeric($course->lec_hours) ? (int) $course->lec_hours : 0,
                            'lab_hours' => is_numeric($course->lab_hours) ? (int) $course->lab_hours : 0,
                            'units' => $course->units ?? 0,
                            'preferred_days' => $preferenceDays,
                            'created_at' => $preference->created_at ? Carbon::parse($preference->created_at)->toDateTimeString() : 'N/A',
                            'updated_at' => $preference->updated_at ? Carbon::parse($preference->updated_at)->toDateTimeString() : 'N/A',
                        ];
                    });
                }
                return collect();
            })->filter();

            return [
                'faculty_id' => $faculty->id,
                'faculty_name' => $facultyUser->formatted_name ?? 'N/A',
                'faculty_code' => $facultyUser->code ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_units,
                'has_request' => (int) ($preferenceSetting->has_request ?? 0),
                'is_enabled' => (int) ($preferenceSetting->is_enabled ?? 0),
                'active_semesters' => [
                    [
                        'active_semester_id' => $activeSemester->active_semester_id,
                        'academic_year_id' => $activeSemester->academic_year_id,
                        'academic_year' => $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end,
                        'semester_id' => $activeSemester->semester_id,
                        'semester_label' => $this->getSemesterLabel($activeSemester->semester_id),
                        'global_start_date' => $preferenceSetting && $preferenceSetting->global_start_date
                        ? Carbon::parse($preferenceSetting->global_start_date)->toDateString() : null,
                        'individual_start_date' => $preferenceSetting && $preferenceSetting->individual_start_date
                        ? Carbon::parse($preferenceSetting->individual_start_date)->toDateString() : null,
                        'global_deadline' => $preferenceSetting && $preferenceSetting->global_deadline ? Carbon::parse($preferenceSetting->global_deadline)->toDateString() : null,
                        'individual_deadline' => $preferenceSetting && $preferenceSetting->individual_deadline
                        ? Carbon::parse($preferenceSetting->individual_deadline)->toDateString()
                        : ($preferenceSetting && $preferenceSetting->global_deadline ? Carbon::parse($preferenceSetting->global_deadline)->toDateString() : null),
                        'courses' => $courses->values()->toArray(),
                    ],
                ],
            ];
        })
        // Sort faculty with 'has_request' set to 1 at the top
            ->sortByDesc('has_request')
            ->sortBy('faculty_name')
            ->values();

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
            ->with([
                'user',
                'preferenceSetting',
                'preferences' => function ($query) use ($activeSemester) {
                    $query->where('active_semester_id', $activeSemester->active_semester_id)
                        ->with(['courseAssignment.course', 'preferenceDays']);
                },
            ])
            ->first();

        if (!$faculty) {
            return response()->json(['error' => 'Faculty not found'], 404);
        }

        $preferenceSetting = $faculty->preferenceSetting;

        $courses = $faculty->preferences->map(function ($preference) {
            $preferenceDays = $preference->preferenceDays->map(function ($day) {
                return [
                    'day' => $day->preferred_day,
                    'start_time' => $day->preferred_start_time,
                    'end_time' => $day->preferred_end_time,
                ];
            })->sortBy('day')->values()->toArray();

            return [
                'course_assignment_id' => $preference->course_assignment_id ?? 'N/A',
                'course_details' => [
                    'course_id' => $preference->courseAssignment->course->course_id ?? 'N/A',
                    'course_code' => $preference->courseAssignment->course->course_code ?? null,
                    'course_title' => $preference->courseAssignment->course->course_title ?? null,
                ],
                'lec_hours' => is_numeric($preference->courseAssignment->course->lec_hours) ? (int) $preference->courseAssignment->course->lec_hours : 0,
                'lab_hours' => is_numeric($preference->courseAssignment->course->lab_hours) ? (int) $preference->courseAssignment->course->lab_hours : 0,
                'units' => $preference->courseAssignment->course->units ?? 0,
                'preferred_days' => $preferenceDays,
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
            'has_request' => (int) ($preferenceSetting->has_request ?? 0),
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

        // Find and delete the specific preference along with its associated days
        $preference = Preference::where('faculty_id', $facultyId)
            ->where('active_semester_id', $activeSemesterId)
            ->where('course_assignment_id', $preference_id)
            ->first();

        if (!$preference) {
            return response()->json(['message' => 'Preference not found.'], 404);
        }

        // Delete related preference days
        PreferenceDay::where('preference_id', $preference->preferences_id)->delete();

        // Delete the preference
        $preference->delete();

        return response()->json(['message' => 'Preference deleted successfully.'], 200);
    }

    /**
     * Deletes all preferences for a specific faculty and active semester.
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
                'message' => 'The submission deadline has passed. You cannot delete preferences.',
            ], 403);
        }

        // Find all preferences for the faculty in the active semester
        $preferences = Preference::where('faculty_id', $facultyId)
            ->where('active_semester_id', $activeSemesterId)
            ->get();

        if ($preferences->isEmpty()) {
            return response()->json(['message' => 'No preferences found for this faculty in the active semester.'], 404);
        }

        // Delete related preference days and then the preferences
        foreach ($preferences as $preference) {
            PreferenceDay::where('preference_id', $preference->preferences_id)->delete();
            $preference->delete();
        }

        return response()->json(['message' => 'All preferences for this faculty in the active semester deleted successfully.'], 200);
    }

    /**
     * Toggles preference settings globally for all faculty members.
     */
    public function toggleAllPreferences(Request $request)
    {
        // Step 1: Validate the input
        $validated = $request->validate([
            'status' => 'required|boolean',
            'global_deadline' => 'nullable|date',
            'global_start_date' => 'nullable|date',
            'send_email' => 'required|boolean',
        ]);

        $sendEmail = $validated['send_email'];

        DB::transaction(function () use ($validated, $sendEmail) {
            $status = $validated['status'];
            $global_deadline = $status && $validated['global_deadline'] ? Carbon::parse($validated['global_deadline'])->endOfDay() : null;
            $global_start_date = $status && $validated['global_start_date'] ? Carbon::parse($validated['global_start_date'])->startOfDay() : null;

            // Current date and start date
            $currentDate = Carbon::now();
            $startDate = $global_start_date;

            // Determine final status
            $finalStatus = false;
            if ($status) {
                // Enable only if start date is today or already passed
                $finalStatus = $startDate ? $startDate->lessThanOrEqualTo($currentDate) : true;
            }

            PreferencesSetting::query()->update([
                'is_enabled' => $finalStatus,
                'global_deadline' => $global_deadline,
                'global_start_date' => $global_start_date,
                'individual_deadline' => null,
                'has_request' => 0,
                'updated_at' => now(),
            ]);

            // Handle faculties without settings
            $facultyWithoutSettings = Faculty::whereDoesntHave('preferenceSetting')->get();
            foreach ($facultyWithoutSettings as $faculty) {
                PreferencesSetting::create([
                    'faculty_id' => $faculty->id,
                    'is_enabled' => $status,
                    'global_deadline' => $global_deadline,
                    'global_start_date' => $global_start_date,
                    'individual_deadline' => null,
                    'has_request' => 0,
                ]);
            }

            // Prepare notification message
            $academicYear = $this->getCurrentAcademicYear();
            $message = $status
            ? "Preferences submission is now open for A.Y. {$academicYear}."
            : "Preferences submission is set to start on {$global_start_date} for A.Y. {$academicYear}.";

            // Fetch all faculty IDs
            $facultyIds = Faculty::pluck('id');

            // Create notifications for all faculties
            $notifications = $facultyIds->map(function ($facultyId) use ($message) {
                return [
                    'faculty_id' => $facultyId,
                    'message' => $message,
                    'is_read' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();

            FacultyNotification::insert($notifications);

            // Dispatch email jobs if sendEmail is true
            if ($sendEmail) {
                $faculties = Faculty::all();
                foreach ($faculties as $faculty) {
                    // Only send email immediately if preferences are enabled now
                    if ($finalStatus) {
                        SendFacultyPreferenceEmailJob::dispatch($faculty->id);
                    } else if ($startDate) {
                        // Schedule the email to be sent on the start date
                        SendFacultyPreferenceEmailJob::dispatch($faculty->id)->delay($startDate);
                    }
                }
            }

            Log::info('Global Deadline (before email):', [
                'deadline' => $global_deadline,
                'days_left' => $startDate && $global_deadline
                ? $startDate->diffInDays($global_deadline)
                : 'Start date or deadline not set',
            ]);
        });

        return response()->json([
            'message' => 'All preferences settings updated successfully',
            'status' => $validated['status'],
            'global_deadline' => $validated['global_deadline'],
            'global_start_date' => $validated['global_start_date'],
            'updated_preferences' => PreferencesSetting::all(),
        ], 200);
    }

    /**
     * Toggles preference settings for a single faculty member.
     */
    public function toggleSinglePreferences(Request $request)
    {
        // Step 1: Validate the input
        $validated = $request->validate([
            'faculty_id' => 'required|integer|exists:faculty,id',
            'status' => 'required|boolean',
            'individual_deadline' => 'nullable|date',
            'individual_start_date' => 'nullable|date',
            'send_email' => 'required|boolean',
        ]);

        $faculty_id = $validated['faculty_id'];
        $status = $validated['status'];
        $individual_deadline = $status && $validated['individual_deadline'] ? Carbon::parse($validated['individual_deadline'])->endOfDay() : null;
        $individual_start_date = $status && $validated['individual_start_date'] ? Carbon::parse($validated['individual_start_date'])->startOfDay() : null;
        $sendEmail = $validated['send_email'];

        DB::transaction(function () use ($validated, $faculty_id, $status, $individual_deadline, $individual_start_date, $sendEmail) {
            // Current date and start date
            $currentDate = Carbon::now();
            $startDate = $individual_start_date;

            // Determine final status
            $finalStatus = false;
            if ($status) {
                // Enable only if start date is today or already passed
                $finalStatus = $startDate ? $startDate->lessThanOrEqualTo($currentDate) : true;
            }

            $preferenceSetting = PreferencesSetting::firstOrCreate(
                ['faculty_id' => $faculty_id],
                [
                    'has_request' => 0,
                    'is_enabled' => 0,
                    'global_deadline' => null,
                    'individual_deadline' => null,
                    'global_start_date' => null,
                    'individual_start_date' => null,
                ]
            );

            $preferenceSetting->update([
                'is_enabled' => $finalStatus,
                'individual_deadline' => $individual_deadline,
                'individual_start_date' => $individual_start_date,
                'global_deadline' => null,
                'global_start_date' => null,
                'has_request' => 0,
            ]);

            // Prepare notification message
            $academicYear = $this->getCurrentAcademicYear();
            $message = $status
            ? "Your preferences submission is now open for A.Y. {$academicYear}."
            : "Your preferences submission is set to start on {$individual_start_date} for A.Y. {$academicYear}.";

            // Create notification for the specific faculty
            FacultyNotification::create([
                'faculty_id' => $faculty_id,
                'message' => $message,
                'is_read' => 0,
            ]);

            // Dispatch email job if sendEmail is true
            if ($sendEmail) {
                $faculty = Faculty::find($faculty_id);
                if ($faculty) {
                    if ($finalStatus) {
                        SendFacultyPreferenceEmailJob::dispatch($faculty_id, true);
                    } else if ($startDate) {
                        SendFacultyPreferenceEmailJob::dispatch($faculty_id, true)->delay($startDate);
                    }
                }
            }

            Log::info('Individual Deadline (before email):', [
                'deadline' => $individual_deadline,
                'days_left' => $startDate && $individual_deadline
                ? $startDate->diffInDays($individual_deadline)
                : 'Start date or deadline not set',
            ]);
        });

        return response()->json([
            'message' => 'Preference setting updated successfully for faculty',
            'faculty_id' => $validated['faculty_id'],
            'is_enabled' => $validated['status'],
            'individual_deadline' => $validated['individual_deadline'],
            'individual_start_date' => $validated['individual_start_date'],
            'updated_preference' => PreferencesSetting::where('faculty_id', $validated['faculty_id'])->first(),
        ], 200);
    }

    /**
     * Handles a faculty requesting access by setting has_request to 1.
     */
    public function requestAccess(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
        ]);

        $facultyId = $validated['faculty_id'];

        $preferenceSetting = PreferencesSetting::where('faculty_id', $facultyId)->first();

        if (!$preferenceSetting) {
            PreferencesSetting::create([
                'faculty_id' => $facultyId,
                'has_request' => 1,
                'is_enabled' => 0,
            ]);
        } else {
            $preferenceSetting->has_request = 1;
            $preferenceSetting->save();
        }

        return response()->json([
            'message' => 'Access request submitted successfully.',
            'has_request' => 1,
        ], 200);
    }

    /**
     * Handles a faculty cancelling access request by setting has_request to 0.
     */
    public function cancelRequestAccess(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculty,id',
        ]);

        $facultyId = $validated['faculty_id'];

        $preferenceSetting = PreferencesSetting::where('faculty_id', $facultyId)->first();

        if (!$preferenceSetting) {
            return response()->json([
                'message' => 'No access request found to cancel.',
            ], 404);
        }

        $preferenceSetting->has_request = 0;
        $preferenceSetting->save();

        return response()->json([
            'message' => 'Access request cancelled successfully.',
            'has_request' => 0,
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
                return 'Summer Semester';
            default:
                return 'Unknown Semester';
        }
    }

    /**
     * Get the current active academic year in 'YYYY-YYYY' format.
     */
    private function getCurrentAcademicYear()
    {
        $activeSemester = ActiveSemester::with('academicYear')->where('is_active', 1)->first();
        if ($activeSemester && $activeSemester->academicYear) {
            return $activeSemester->academicYear->year_start . '-' . $activeSemester->academicYear->year_end;
        }
        return 'N/A';
    }
}
