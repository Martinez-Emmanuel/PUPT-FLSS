<?php

namespace App\Jobs;

use App\Http\Controllers\External\v1\ExternalController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessExternalScheduleChange implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * The number of seconds to wait before retrying the job.
     * Implements exponential backoff: 1st retry after 10s, 2nd after 30s, 3rd after 60s
     *
     * @var array
     */
    public $backoff = [10, 30, 60];

    /**
     * Delete the job if its models no longer exist.
     *
     * @var bool
     */
    public $deleteWhenMissingModels = true;

    protected $action;
    protected $isPublished;
    protected $facultyId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $action, bool $isPublished, ?int $facultyId = null)
    {
        $this->action = $action;
        $this->isPublished = $isPublished;
        $this->facultyId = $facultyId;
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->action . '_' . ($this->facultyId ?? 'all') . '_' . ($this->isPublished ? 'publish' : 'unpublish');
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff()
    {
        return $this->backoff[$this->attempts() - 1] ?? 60;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Attempting to notify ECRS about schedule change', [
                'attempt' => $this->attempts(),
                'action' => $this->action,
                'is_published' => $this->isPublished,
                'faculty_id' => $this->facultyId,
            ]);

            $response = ExternalController::ECRSScheduleChange(
                $this->action,
                $this->isPublished,
                $this->facultyId
            );

            Log::info('Successfully notified ECRS about schedule change', [
                'attempt' => $this->attempts(),
                'action' => $this->action,
                'is_published' => $this->isPublished,
                'faculty_id' => $this->facultyId,
                'response' => $response,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process external schedule change', [
                'attempt' => $this->attempts(),
                'action' => $this->action,
                'is_published' => $this->isPublished,
                'faculty_id' => $this->facultyId,
                'error' => $e->getMessage(),
                'remaining_attempts' => $this->tries - $this->attempts(),
            ]);

            if ($this->attempts() < $this->tries) {
                throw $e;
            }

            Log::critical('External schedule change failed after all retries', [
                'action' => $this->action,
                'is_published' => $this->isPublished,
                'faculty_id' => $this->facultyId,
                'final_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical('External schedule change job failed permanently', [
            'action' => $this->action,
            'is_published' => $this->isPublished,
            'faculty_id' => $this->facultyId,
            'error' => $exception->getMessage(),
            'total_attempts' => $this->attempts(),
        ]);
    }
}
