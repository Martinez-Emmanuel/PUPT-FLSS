<?php

namespace App\Http\Controllers;

use App\Models\ActiveSemester;
use App\Models\Faculty;
use App\Models\FacultyNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FacultyNotificationController extends Controller
{
    /**
     * Retrieve notifications for the authenticated faculty.
     */
    public function getFacultyNotifications(Request $request)
    {
        $user = Auth::user();

        // Ensure the user is authenticated and is a faculty member
        if (!$user || $user->role !== 'faculty') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Retrieve the associated faculty profile
        $faculty = $user->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'Faculty profile not found.'], 404);
        }

        // Fetch notifications ordered by most recent
        $notifications = FacultyNotification::where('faculty_id', $faculty->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications,
        ], 200);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();

        // Ensure the user is authenticated and is a faculty member
        if (!$user || $user->role !== 'faculty') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Retrieve the associated faculty profile
        $faculty = $user->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'Faculty profile not found.'], 404);
        }

        // Find the notification
        $notification = FacultyNotification::where('id', $id)
            ->where('faculty_id', $faculty->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        // Update the notification status
        $notification->is_read = 1;
        $notification->save();

        return response()->json(['message' => 'Notification marked as read.'], 200);
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
                'message' => "has requested to reopen their preferences submission.",
            ];
        });

        return response()->json($notifications, 200);
    }
}
