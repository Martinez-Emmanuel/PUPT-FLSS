<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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
            'faculty_name' => $faculty->faculty_name,
            'email' => $faculty->faculty_email
        ];

        Mail::send('emails.faculty_notification', $data, function ($message) use ($data) {
            $message->to($data['email'])
                ->subject('Set and Submit Your Subject Preference');
        });
    }
    public function testEmail()
    {
        $data = [
            'faculty_name' => 'Juan Dela Cruz', // Sample data for testing
        ];

        return view('emails.faculty_notification', $data);
    }
}
