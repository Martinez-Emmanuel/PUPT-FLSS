<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PreferencesSubmitted;
class FacultyController extends Controller
{
    public function getFaculty()
    {
        return response()->json(Faculty::all(), 200);
    }

    public function sendEmails()
    {
        $faculties = Faculty::all();

        foreach ($faculties as $faculty) {
            $this->sendEmail($faculty);
        }

        return response()->json(['message' => 'Emails sent successfully'], 200);
    }

    protected function sendEmail($faculty)
    {
        $data = [
            'faculty_name' => $faculty->user->name, 
            'email' => $faculty->faculty_email,
            'faculty_unit' => $faculty->faculty_unit,
        ];

        Mail::send('emails.faculty_notification', $data, function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Set and Submit Your Subject Preference');
        });
    }

    public function testEmail()
    {
        $data = [
            'faculty_name' => 'Juan Dela Cruz',
            'faculty_unit' => '30', 
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
}
