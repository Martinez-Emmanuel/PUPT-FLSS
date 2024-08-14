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
            'faculty_name' => $faculty->user->name, // Assuming the Faculty model has a user relationship
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
            'faculty_name' => 'Juan Dela Cruz', // Sample data for testing
            'faculty_unit' => '30', // Example faculty unit
        ];

        return view('emails.faculty_notification', $data);
    }
}
