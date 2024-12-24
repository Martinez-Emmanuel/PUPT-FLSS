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

    public $tries = 10;
    public $timeout = 300;

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
        $dataSchedule = [
            'faculty_name' => $this->faculty->user->name,
            'email' => $this->faculty->user->email,
        ];

        Mail::send('emails.load_schedule_published', $dataSchedule, function ($message) use ($dataSchedule) {
            $message->to($dataSchedule['email'])
                ->subject('Your Official Load & Schedule is now available');
        });
    }

    /**
     * Handle job failure.
     *
     * @return void
     */
    public function failed(Exception $exception)
    {
        \Log::error('Failed to send schedule email to faculty: ' . $this->faculty->faculty_email . ' Error: ' . $exception->getMessage());
    }
}
