<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendFacultyPreferenceEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $faculty;

    public $tries = 5; // Retry up to 5 times
    public $timeout = 120; // Timeout after 120 seconds

    /**
     * Create a new job instance.
     *
     * @param  $faculty  The faculty instance passed from the controller
     */
    public function __construct($faculty)
    {
        $this->faculty = $faculty;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Prepare the data for the "Set and Submit Your Subject Preference" email
        $dataPreference = [
            'faculty_name' => $this->faculty->user->name,
            'email' => $this->faculty->faculty_email,
            'faculty_units' => $this->faculty->faculty_units,
        ];

        // Send the email
        Mail::send('emails.faculty_notification', $dataPreference, function ($message) use ($dataPreference) {
            $message->to($dataPreference['email'])
                ->subject('Set and Submit Your Subject Preference');
        });
    }

    /**
     * Handle job failure.
     *
     * @return void
     */
    public function failed(Exception $exception)
    {
        // Log the failure or notify the admin
        \Log::error('Failed to send preference email to faculty: ' . $this->faculty->faculty_email . ' Error: ' . $exception->getMessage());
    }
}
