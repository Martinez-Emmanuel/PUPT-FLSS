<?php

namespace App\Jobs;

use App\Models\Faculty;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NotifyGlobalFacultyDeadlineJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $faculty;

    public function __construct(Faculty $faculty)
    {
        $this->faculty = $faculty;
    }

    public function handle()
    {
        $facultyUser = $this->faculty->user;

        if (!$facultyUser || !$facultyUser->email) {
            Log::error("❌ Faculty email is missing for faculty ID: {$this->faculty->id}");
            return;
        }

        $facultyName = "{$facultyUser->last_name}, {$facultyUser->first_name}";

        $data = [
            'faculty_name' => $facultyName,
            'deadline' => Carbon::parse($this->faculty->preferenceSetting->global_deadline)->format('F d, Y'),
        ];

        try {
            Mail::send('emails.global_deadline_warning', $data, function ($message) use ($facultyUser) {
                $message->to($facultyUser->email)
                    ->subject('24-Hour Notification: Global Deadline Approaching');
            });

            Log::info("✅ Global deadline email sent to faculty ID: {$this->faculty->id}, Email: {$facultyUser->email}");
        } catch (\Exception $e) {
            Log::error("❌ Failed to send global deadline email to faculty ID: {$this->faculty->id}. Error: {$e->getMessage()}");
        }
    }
}
