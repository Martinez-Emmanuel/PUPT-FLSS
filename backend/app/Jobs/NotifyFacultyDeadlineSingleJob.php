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

class NotifyFacultyDeadlineSingleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $faculty;

    /**
     * Create a new job instance.
     *
     * @param Faculty $faculty
     */
    public function __construct(Faculty $faculty)
    {
        $this->faculty = $faculty;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        $facultyUser = $this->faculty->user; // ✅ Corrected relationship

        if (!$facultyUser || !$facultyUser->email) {
            Log::error("❌ Faculty email is missing for faculty ID: {$this->faculty->id}");
            return;
        }

        $facultyName = $this->formatName(
            $facultyUser->last_name,
            $facultyUser->first_name,
            $facultyUser->middle_name,
            $facultyUser->suffix_name
        );

        $data = [
            'faculty_name' => $facultyName,
            'deadline' => Carbon::parse($this->faculty->preferenceSetting->individual_deadline)->format('F d, Y'),
        ];

        try {
            Mail::send('emails.faculty_deadline_warning', $data, function ($message) use ($facultyUser) {
                $message->to($facultyUser->email)
                        ->subject('24-Hour Notification: Individual Deadline Approaching');
            });

            Log::info("✅ Email sent successfully to faculty ID: {$this->faculty->id}, Email: {$facultyUser->email}");
        } catch (\Exception $e) {
            Log::error("❌ Failed to send email to faculty ID: {$this->faculty->id}. Error: {$e->getMessage()}");
        }
    }

    /**
     * Format the faculty's full name.
     */
    private function formatName($lastName, $firstName, $middleName = null, $suffixName = null)
    {
        $name = "{$lastName}, {$firstName}";
        if ($middleName) {
            $name .= " {$middleName}";
        }
        if ($suffixName) {
            $name .= " {$suffixName}";
        }

        return trim($name);
    }
}
