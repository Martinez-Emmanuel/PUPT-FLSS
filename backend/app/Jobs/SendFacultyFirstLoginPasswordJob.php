<?php

namespace App\Jobs;

use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendFacultyFirstLoginPasswordJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $faculty;
    protected $password;

    public $tries = 5;
    public $timeout = 60;

    /**
     * Create a new job instance.
     *
     * @param  $faculty  The faculty user instance
     * @param  string  $password  The generated password
     * @return void
     */
    public function __construct($faculty, $password)
    {
        $this->faculty = $faculty;
        $this->password = $password;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $data = [
            'faculty_name' => $this->faculty->name,
            'password' => $this->password,
        ];

        Mail::send('emails.faculty_first_login_password', $data, function ($message) {
            $message->to($this->faculty->email)
                ->subject('Your PUPT FLSS Account Password');
        });
    }

    /**
     * Handle a job failure.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function failed(Exception $exception)
    {
        \Log::error('Failed to send faculty first login password email', [
            'faculty_code' => $this->faculty->code,
            'error' => $exception->getMessage(),
        ]);
    }
}
