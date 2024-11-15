<?php

namespace App\Http\Controllers;

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
}
