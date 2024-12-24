<?php

namespace App\Jobs;

use App\Models\Faculty as FacultyModel;
use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendFacultyPreferenceEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $facultyId;
    protected $is_individual;
    protected $individual_deadline;
    protected $global_deadline;

    public $tries = 10;
    public $timeout = 300;

    /**
     * Create a new job instance.
     *
     * @param int $facultyId The ID of the faculty member.
     * @param bool $is_individual Indicates if the email is for an individual deadline.
     */
    public function __construct(int $facultyId, $is_individual = false)
    {
        $this->facultyId = $facultyId;
        $this->is_individual = $is_individual;

        // Retrieve preference settings for the faculty.
        $settings = PreferencesSetting::where('faculty_id', $facultyId)->first();

        // Only set deadlines if settings exist
        if ($settings) {
            $this->individual_deadline = $settings->individual_deadline;
            $this->global_deadline = $settings->global_deadline;
        } else {
            $this->individual_deadline = null;
            $this->global_deadline = null;
        }
    }

    /**
     * Execute the job.
     *
     * This method sends an email to the faculty member regarding their preference submission.
     */
    public function handle()
    {
        // Retrieve the faculty model using the provided ID with eager loading of user relationship
        $faculty = FacultyModel::with('user')->find($this->facultyId);

        // Log an error and return if the faculty is not found
        if (!$faculty) {
            Log::error('Faculty not found with ID: ' . $this->facultyId);
            return;
        }

        // Log an error and return if the user relationship is not found
        if (!$faculty->user) {
            Log::error('User not found for faculty ID: ' . $this->facultyId);
            return;
        }

        // Retrieve the preference settings for the faculty
        $settings = PreferencesSetting::where('faculty_id', $this->facultyId)->first();

        // Log an error and return if preference settings are not found
        if (!$settings) {
            Log::error('PreferencesSetting not found for faculty ID: ' . $this->facultyId);
            return;
        }

        // Return early if preference emails are disabled for this faculty
        if (!$settings->is_enabled) {
            return;
        }

        // Determine the deadline based on whether it's an individual or global notification
        $deadline = $this->is_individual && $this->individual_deadline
        ? $this->individual_deadline
        : $this->global_deadline;

        // Format the deadline for display in the email
        $formatted_deadline = $deadline ? $deadline->setTimezone('Asia/Manila')->format('M d, Y') : 'No deadline set';

        // Calculate the number of days left until the deadline
        $days_left = null;
        if ($deadline) {
            $today = Carbon::now('Asia/Manila');
            $days_left = $today->diffInDays($deadline, false);

            // Adjust days left if the deadline is today
            if ($today->copy()->endOfDay()->gt($today)) {
                $days_left++;
            }

            $days_left = floor($days_left);
        }

        // Prepare data to be passed to the email template with null checks
        $dataPreference = [
            'faculty_name' => $faculty->user->name ?? 'Faculty Member',
            'email' => $faculty->user->email,
            'faculty_units' => $faculty->faculty_units ?? 0,
            'deadline' => $formatted_deadline,
            'days_left' => $days_left,
        ];

        // Determine the email template to use based on whether it's an individual notification
        $template = $this->is_individual ? 'emails.preferences_single_open' : 'emails.preferences_all_open';

        // Attempt to send the email with proper error handling
        try {
            if (!$dataPreference['email']) {
                throw new \Exception('Faculty email address is missing');
            }

            Mail::send($template, $dataPreference, function ($message) use ($dataPreference) {
                $message->to($dataPreference['email'])
                    ->subject('Faculty Load & Schedule Preferences Submission is now open');
            });
        } catch (\Exception $e) {
            Log::error('Failed to send email to ' . ($dataPreference['email'] ?? 'unknown email') . ': ' . $e->getMessage());
            throw $e; // Re-throw to trigger job retry
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  \Exception  $exception The exception that caused the failure.
     */
    public function failed(Exception $exception)
    {
        // Log the error message if the job fails.
        Log::error('Job failed: ' . $exception->getMessage());
    }
}
