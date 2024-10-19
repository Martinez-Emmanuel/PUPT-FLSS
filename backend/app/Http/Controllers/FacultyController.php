<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PreferencesSubmitted;
use App\Jobs\SendFacultyEmailJob;
use App\Jobs\SendFacultyPreferenceEmailJob;
class FacultyController extends Controller
{
    public function getFaculty()
    {
        return response()->json(Faculty::all(), 200);
    }

    public function sendEmails()
    {
        // Retrieve all faculties from the database
        $faculties = Faculty::all();
    
        // Loop through each faculty and dispatch the email job asynchronously
        foreach ($faculties as $faculty) {
            // Dispatch the new preference email job for each faculty
            SendFacultyPreferenceEmailJob::dispatch($faculty);
        }
    
        // Return a response after the jobs are dispatched
        return response()->json(['message' => 'Preference emails are being sent asynchronously'], 200);
    }
    public function testEmail()
    {
        $data = [
            'faculty_name' => 'Juan Dela Cruz',
            'faculty_units' => '30', 
        ];

        return view('emails.faculty_notification', $data);
    }

    public function sendPreferencesSubmittedEmail(Request $request)
    {
        $facultyId = $request->input('faculty_id');
    
        $faculty = Faculty::find($facultyId);
    
        if ($faculty) {
            $this->sendPreferencesSubmittedNotification($faculty);
            return response()->json(['message' => 'Preferences submission notification sent successfully'], 200);
        } else {
            return response()->json(['message' => 'Faculty not found'], 404);
        }
    }
    

    protected function sendPreferencesSubmittedNotification($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.preferences_submitted', $data, function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Your Preferences Have Been Submitted and Are Under Review');
        });
    }
    public function sendSubjectsScheduleSetEmail(Request $request)
    {
        $facultyId = $request->input('faculty_id');

        $faculty = Faculty::find($facultyId);

        if ($faculty) {
            $this->sendSubjectsScheduleSetNotification($faculty);
            return response()->json(['message' => 'Subjects, load, and schedule set notification sent successfully'], 200);
        } else {
            return response()->json(['message' => 'Faculty not found'], 404);
        }
    }

    protected function sendSubjectsScheduleSetNotification($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name,
            'email' => $faculty->faculty_email,
        ];

        Mail::send('emails.subjects_schedule_set', $data, function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Your Subjects, Load, and Schedule Have Been Set');
        });
    }

    public function sendEmailsToAllFaculties()
    {
        // Retrieve all faculties from the database
        $faculties = Faculty::all();
        
        // Loop through each faculty and dispatch the job to send the emails
        foreach ($faculties as $faculty) {
            // Dispatch the email sending job to the queue
            SendFacultyEmailJob::dispatch($faculty);
        }
    
        // Return a response after the jobs are dispatched
        return response()->json(['message' => 'Emails are being sent asynchronously'], 200);
    }
    
}
