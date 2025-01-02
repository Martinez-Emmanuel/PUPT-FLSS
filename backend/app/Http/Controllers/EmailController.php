<?php

namespace App\Http\Controllers;

use App\Jobs\SendFacultyScheduleEmailJob;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{

    protected function sendPreferencesSubmittedNotification($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->user->email,
        ];

        Mail::send('emails.preferences_submitted', $data, function ($message) use ($data) {
            $message->to($data['email'])
                ->subject('Your Load & Schedule Preferences has been submitted successfully');
        });
    }

    /**
     * Send email to a specific faculty to view their load and schedule.
     */
    public function emailAllFacultySchedule()
    {
        $faculties = Faculty::all();

        foreach ($faculties as $faculty) {
            SendFacultyScheduleEmailJob::dispatch($faculty);
        }

        return response()->json(['message' => 'Emails are being sent asynchronously'], 200);
    }

    /**
     * Send email to a specific faculty to view their load and schedule.
     */
    public function emailSingleFacultySchedule(Request $request)
    {
        $facultyId = $request->input('faculty_id');
        $faculty = Faculty::find($facultyId);

        if (!$faculty) {
            return response()->json(['message' => 'Faculty not found'], 404);
        }

        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->user->email,
        ];

        Mail::send('emails.load_schedule_published', $data, function ($message) use ($data) {
            $message->to($data['email'])
                ->subject('Your Official Load & Schedule is now available');
        });

        return response()->json(['message' => 'Faculty load and schedule email notification sent successfully'], 200);
    }

    public function notifyAdminsOfPreferenceChange(Request $request)
    {
        $facultyId = $request->input('faculty_id');

        // Retrieve the faculty details
        $faculty = Faculty::find($facultyId);
        if (!$faculty || !$faculty->user) {
            return response()->json(['message' => 'Faculty not found or missing user details'], 404);
        }

        // Retrieve all active admins
        $admins = \App\Models\User::where('role', 'admin')
            ->where('status', 'Active')
            ->get();

        if ($admins->isEmpty()) {
            return response()->json(['message' => 'No active admins found'], 404);
        }

        // Dispatch a job for each admin
        foreach ($admins as $admin) {
            \App\Jobs\NotifyAdminOfPreferenceChangeJob::dispatch($faculty, $admin);
        }

        return response()->json([
            'message' => 'Admin notifications are being sent asynchronously',
        ], 200);
    }

    public function testSingle()
    {
        return view('emails.preferences_single_open', [
            'faculty_name' => 'Juan Dela Cruz',
            'deadline' => 'Nov 23, 2024',
            'days_left' => 5,
        ]);
    }

    public function testAll()
    {
        return view('emails.preferences_all_open', [
            'faculty_name' => 'Juan Dela Cruz',
            'deadline' => 'Nov 23, 2024',
            'days_left' => 5,
        ]);
    }

    public function testSchedulePublished()
    {
        return view('emails.load_schedule_published', [
            'faculty_name' => 'Juan Dela Cruz',
        ]);
    }

    public function testFacultyFirstLoginPassword()
    {
        return view('emails.faculty_first_login_password', [
            'faculty_name' => 'Juan Dela Cruz',
            'password' => '123456',
        ]);
    }
}
