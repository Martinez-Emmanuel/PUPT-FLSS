<?php

namespace App\Jobs;

use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendFacultyScheduleEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $faculty;

    public $tries = 5;
    public $timeout = 120;

    /**
     * Create a new job instance.
     *
     * @param  $faculty  The faculty instance passed from the controller
     * @return void
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
        // Prepare data for the "Subjects, Load, and Schedule Set" email
        $dataSchedule = [
            'faculty_name' => $this->faculty->user->name,
            'email' => $this->faculty->faculty_email,
        ];

        // Send the "Subjects, Load, and Schedule Set" email
        Mail::send('emails.subjects_schedule_set', $dataSchedule, function ($message) use ($dataSchedule) {
            $message->to($dataSchedule['email'])
                ->subject('Your Subjects, Load, and Schedule Have Been Set');
        });
    }

    /**
     * Handle job failure.
     *
     * @return void
     */
    public function failed(Exception $exception)
    {
        // Log the failure
        \Log::error('Failed to send schedule email to faculty: ' . $this->faculty->faculty_email . ' Error: ' . $exception->getMessage());
    }
}
