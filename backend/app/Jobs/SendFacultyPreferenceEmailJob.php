<?php

namespace App\Jobs;

use App\Models\PreferencesSetting;
use Carbon\Carbon;
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
    protected $global_deadline;
    protected $days_left;

    public $tries = 5;
    public $timeout = 120;
    /**
     * Create a new job instance.
     *
     * @param  $faculty  The faculty instance passed from the controller
     */
    public function __construct($faculty)
    {
        $this->faculty = $faculty;

        // Retrieve the global deadline for the faculty member
        $settings = PreferencesSetting::where('faculty_id', $faculty->id)->first();
        $this->global_deadline = $settings->global_deadline ?? null;

        if ($this->global_deadline) {
            // Calculate days left
            $deadline = Carbon::parse($this->global_deadline);
            $today = Carbon::now();
            $this->days_left = $deadline->diffInDays($today);
        } else {
            $this->days_left = null;
        }
    }
    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $dataPreference = [
            'faculty_name' => $this->faculty->user->name,
            'email' => $this->faculty->user->email,
            'faculty_units' => $this->faculty->faculty_units,
            'global_deadline' => $this->global_deadline ? $this->global_deadline->format('M d, Y') : 'No deadline set',
            'days_left' => $this->days_left,
        ];

        Mail::send('emails.preferences_all_open', $dataPreference, function ($message) use ($dataPreference) {
            $message->to($dataPreference['email'])
                ->subject('Faculty Load & Schedule Preferences Submission is now open');
        });
    }

    /**
     * Handle job failure.
     *
     * @return void
     */
    public function failed(Exception $exception)
    {
        \Log::error('Failed to send preference email to faculty: ' . $this->faculty->faculty_email . ' Error: ' . $exception->getMessage());
    }
}
