<?php

namespace App\Http\Controllers;

use App\Jobs\SendFacultyPreferenceEmailJob;
use App\Jobs\SendFacultyScheduleEmailJob;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{

    /**
     * Send email to all faculty members to submit their preferences.
     */
    public function emailAllFacultyPreferences()
    {
        $faculties = Faculty::all();

        foreach ($faculties as $faculty) {
            SendFacultyPreferenceEmailJob::dispatch($faculty);
        }

        // Return a response after the jobs are dispatched
        return response()->json(['message' => 'Preference emails are being sent asynchronously'], 200);
    }

    /**
     * Send email to a specific faculty to submit their preferences.
     */
    public function emailSingleFacultyPreferences(Request $request)
    {
        $facultyId = $request->input('faculty_id');
        $faculty = Faculty::find($facultyId);

        if (!$faculty) {
            return response()->json(['message' => 'Faculty not found'], 404);
        }

        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.preferences_single_open', $data, function ($message) use ($data) {
            $message->to($data['email'])
                ->subject('Load & Schedule Preferences Submission Update');
        });

        return response()->json(['message' => 'Preference status notification sent successfully'], 200);
    }

    /**
     * Send email to a specific faculty to notify that
     * their preferences have been submitted and received.
     */
    public function emailPrefSubmitted(Request $request)
    {
        $facultyId = $request->input('faculty_id');
        $faculty = Faculty::find($facultyId);

        if (!$faculty) {
            return response()->json(['message' => 'Faculty not found'], 404);
        }

        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.preferences_submitted', $data, function ($message) use ($data) {
            $message->to($data['email'])
                ->subject('Your Load & Schedule Preferences has been submitted successfully');
        });

        return response()->json(['message' => 'Preferences submission notification sent successfully'], 200);
    }

    /**
     * Send email to all faculty to view their load and schedule.
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
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.load_schedule_published', $data, function ($message) use ($data) {
            $message->to($data['email'])
                ->subject('Your Official Load & Schedule is now available');
        });

        return response()->json(['message' => 'Faculty load and schedule email notification sent successfully'], 200);
    }
}
