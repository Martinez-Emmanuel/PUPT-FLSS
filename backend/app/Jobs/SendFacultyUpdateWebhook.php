<?php

namespace App\Jobs;

use App\Jobs\Middleware\PreventDuplicateWebhooks;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendFacultyUpdateWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maximum retry attempts for the job
     *
     * @var int
     */
    public $tries = 100;

    /**
     * Calculates retry delays using exponential backoff
     * Starts at 1 minute, doubles each attempt, caps at 24 hours
     *
     * @return array
     */
    public function backoff()
    {
        $delays = [];
        $delay = 60;
        $maxDelay = 24 * 60 * 60;

        // Generate delays with exponential backoff
        for ($i = 0; $i < $this->tries; $i++) {
            $delays[] = min($delay, $maxDelay);
            $delay *= 2;
        }

        return $delays;
    }

    /**
     * Sets the maximum time until the job can be retried
     * Job will be discarded after 30 days
     *
     * @return \DateTime
     */
    public function retryUntil()
    {
        // Retry for 30 days
        return now()->addDays(30);
    }

    /**
     * Delete the job if its models no longer exist.
     *
     * @var bool
     */
    public $deleteWhenMissingModels = true;

    /**
     * The unique ID of this webhook request
     */
    protected $webhookId;

    /**
     * The event type and faculty data to be sent
     */
    protected $event;
    protected $facultyData;
    protected $webhookUrl;
    protected $webhookSecret;
    protected $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(string $event, array $facultyData)
    {
        $this->event = $event;
        $this->facultyData = $facultyData;
        $this->webhookUrl = env('HRIS_WEBHOOK_URL', 'http://localhost:3000/api/webhooks/faculty');
        $this->webhookSecret = env('WEBHOOK_SECRET');

        // Generate a unique ID for this webhook request
        $this->webhookId = Str::uuid()->toString();
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array
     */
    public function middleware()
    {
        return [new PreventDuplicateWebhooks($this->getIdempotencyKey())];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if this webhook was already successfully processed
            $cacheKey = $this->getIdempotencyKey();
            if (Cache::has($cacheKey)) {
                Log::info('Webhook already processed successfully', [
                    'webhook_id' => $this->webhookId,
                    'idempotency_key' => $cacheKey,
                ]);
                return;
            }

            if (!$this->webhookSecret) {
                Log::error('Cannot send webhook: Webhook secret is not set');
                $this->fail(new \Exception('Webhook secret is not set'));
                return;
            }

            if (isset($this->facultyData['faculty_code'])) {
                $faculty = \App\Models\Faculty::whereHas('user', function ($query) {
                    $query->where('code', $this->facultyData['faculty_code']);
                })->first();

                if ($faculty && $faculty->hris_user_id) {
                    $this->facultyData['hris_user_id'] = $faculty->hris_user_id;
                }
            }

            Log::info('Sending webhook to HRIS', [
                'webhook_id' => $this->webhookId,
                'event' => $this->event,
                'faculty_data' => $this->facultyData,
                'webhook_url' => $this->webhookUrl,
                'attempt' => $this->attempts(),
            ]);

            $payload = [
                'webhook_id' => $this->webhookId,
                'event' => $this->event,
                'faculty_data' => $this->facultyData,
                'timestamp' => now()->toIso8601String(),
            ];

            $jsonPayload = json_encode($payload);
            $signature = $this->generateSignature($jsonPayload);

            if (!$signature) {
                Log::error('Cannot send webhook: Failed to generate signature');
                $this->fail(new \Exception('Failed to generate signature'));
                return;
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-hris-secret' => $signature,
                    'x-webhook-id' => $this->webhookId,
                ])
                ->post($this->webhookUrl, $payload);

            if (!$response->successful()) {
                Log::error('Webhook request failed', [
                    'webhook_id' => $this->webhookId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'attempt' => $this->attempts(),
                ]);

                if ($response->status() >= 400 && $response->status() < 500
                    && !in_array($response->status(), [408, 429])) {
                    $this->fail(new \Exception("Webhook request failed with client error {$response->status()}"));
                    return;
                }

                // For 409 Conflict (already processed), mark as success
                if ($response->status() === 409) {
                    Log::info('Webhook already processed by receiver', [
                        'webhook_id' => $this->webhookId,
                    ]);
                    $this->markAsProcessed($cacheKey);
                    return;
                }

                throw new \Exception("Webhook request failed with status {$response->status()}");
            }

            Log::info('Webhook sent successfully', [
                'webhook_id' => $this->webhookId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            // Mark this webhook as successfully processed
            $this->markAsProcessed($cacheKey);
        } catch (\Exception $e) {
            Log::error('Error sending webhook', [
                'webhook_id' => $this->webhookId,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate HMAC signature for payload
     */
    protected function generateSignature(string $payload): ?string
    {
        if (!$this->webhookSecret) {
            return null;
        }

        return hash_hmac('sha256', $payload, $this->webhookSecret);
    }

    /**
     * Get the idempotency key for this webhook
     */
    protected function getIdempotencyKey(): string
    {
        return 'webhook:' . md5($this->webhookId . ':' . $this->event . ':' . json_encode($this->facultyData));
    }

    /**
     * Mark a webhook as successfully processed
     */
    protected function markAsProcessed(string $key): void
    {
        Cache::put($key, true, now()->addDays(30));
    }
}
