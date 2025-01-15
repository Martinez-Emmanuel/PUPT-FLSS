<?php

namespace App\Http\Controllers;

use App\Jobs\NotifyFacultyDeadlineSingleJob;
use App\Jobs\NotifyGlobalFacultyDeadlineJob;
use App\Jobs\SendFacultyScheduleEmailJob;
use App\Models\Faculty;
use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{

    /**
     * Send email to a specific faculty before their deadline for testing only.
     */
    public function notifyFacultyBeforeDeadlineSingle()
    {
        $tomorrow = Carbon::now('Asia/Manila')->addDay()->startOfDay();

        // Fetch faculties with deadlines exactly 24 hours away
        $faculties = PreferencesSetting::with('faculty.user')
            ->whereNotNull('individual_deadline')
            ->whereDate('individual_deadline', $tomorrow)
            ->get();

        if ($faculties->isEmpty()) {
            Log::info('No faculties have deadlines in the next 24 hours.');
            return response()->json([
                'message' => 'No faculties with deadlines in the next 24 hours.',
            ], 200);
        }

        foreach ($faculties as $preference) {
            if ($preference->faculty && $preference->faculty->user) {
                NotifyFacultyDeadlineSingleJob::dispatch($preference->faculty);
                Log::info("Notification dispatched for faculty ID: {$preference->faculty->id}");
            }
        }

        return response()->json([
            'message' => 'Faculty deadline notifications dispatched successfully.',
            'notified_count' => $faculties->count(),
        ], 200);
    }
    /**
     * Send email to a specific faculty before their deadline for testing only.
     */
    public function singleDeadlineNotification(Request $request)
    {
        $facultyId = $request->input('faculty_id');

        $preference = PreferencesSetting::with('faculty.user')
            ->where('faculty_id', $facultyId)
            ->whereNotNull('individual_deadline')
            ->first();

        if (!$preference) {
            return response()->json([
                'message' => 'Faculty with this ID does not have an individual deadline.',
            ], 404);
        }

        if (!$preference->faculty || !$preference->faculty->user) {
            return response()->json([
                'message' => 'Faculty details are incomplete or missing.',
            ], 404);
        }

        NotifyFacultyDeadlineSingleJob::dispatch($preference->faculty);
        Log::info("Test notification dispatched for faculty ID: {$preference->faculty->id}");

        return response()->json([
            'message' => 'Test faculty notification dispatched successfully.',
            'faculty_id' => $facultyId,
        ], 200);
    }

    /**
     * Send email to all faculty before their deadline for testing only.
     */
    public function notifyGlobalFacultyDeadline()
    {
        $tomorrow = Carbon::now('Asia/Manila')->addDay()->startOfDay();

        $globalSettings = PreferencesSetting::with('faculty.user')
            ->whereNotNull('global_deadline')
            ->whereDate('global_deadline', $tomorrow)
            ->get();

        if ($globalSettings->isEmpty()) {
            Log::info('✅ No global deadline notifications required.');
            return response()->json([
                'message' => 'No global deadline notifications required.',
            ], 200);
        }

        foreach ($globalSettings as $setting) {
            if ($setting->faculty && $setting->faculty->user) {
                NotifyGlobalFacultyDeadlineJob::dispatch($setting->faculty);
                Log::info("✅ Notification dispatched for global deadline, faculty ID: {$setting->faculty->id}");
            }
        }

        return response()->json([
            'message' => '✅ Global faculty deadline notifications dispatched successfully.',
            'notified_count' => $globalSettings->count(),
        ], 200);
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
