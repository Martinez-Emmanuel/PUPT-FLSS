<?php

namespace App\Http\Controllers;

use App\Jobs\SendFacultyUpdateWebhook;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{

    protected $hrisWebhookUrl;
    protected $webhookSecret;
    protected $maxPayloadSize;

    public function __construct()
    {
        $this->hrisWebhookUrl = env('HRIS_WEBHOOK_URL', 'http://localhost:3000/api/webhooks/faculty');
        $this->webhookSecret = env('WEBHOOK_SECRET');
        $this->maxPayloadSize = 1024 * 1024; // 1MB limit
        Log::info('WebhookController initialized with URL: ' . $this->hrisWebhookUrl);
    }

    /**
     * Handle incoming webhooks from the HRIS system for faculty updates.
     *
     * @param Request $request The incoming HTTP request containing the webhook payload.
     * @return \Illuminate\Http\JsonResponse A JSON response indicating the status of the webhook processing.
     * @throws \Exception If there is an error processing the webhook.
     */
    public function handleFacultyWebhook(Request $request)
    {
        try {
            Log::info('Received webhook from HRIS', [
                'headers' => $request->headers->all(),
                'body' => $request->all(),
            ]);

            $payloadSize = strlen($request->getContent());
            if ($payloadSize > $this->maxPayloadSize) {
                Log::error('Payload too large', ['size' => $payloadSize]);
                return response()->json(['error' => 'Payload too large'], 413);
            }

            if (!$request->isJson()) {
                Log::error('Invalid content type', ['content_type' => $request->header('Content-Type')]);
                return response()->json(['error' => 'Invalid content type'], 415);
            }

            $signature = $request->header('X-HRIS-Secret');
            if (!$signature) {
                Log::error('No signature provided in headers');
                return response()->json(['error' => 'No signature provided'], 401);
            }

            Log::debug('Received signature: ' . $signature);
            Log::debug('Raw content for verification:', ['content' => $request->getContent()]);

            // Verify signature using raw content
            if (!$this->verifySignature($request->getContent(), $signature)) {
                Log::error('Invalid signature', [
                    'received' => $signature,
                    'expected' => $this->generateSignature($request->getContent()),
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            Log::info('Signature verified successfully');

            $payload = $request->json()->all();
            $event = $payload['event'] ?? null;
            $facultyData = $payload['faculty_data'] ?? null;
            $webhookId = $payload['webhook_id'] ?? null;

            if (!$event || !$facultyData || !$webhookId) {
                Log::error('Invalid payload structure', ['payload' => $payload]);
                return response()->json(['error' => 'Invalid payload'], 400);
            }

            // Check if we've already processed this webhook
            $processedKey = 'processed_webhook:' . $webhookId;
            if (Cache::has($processedKey)) {
                Log::info('Webhook already processed', ['webhook_id' => $webhookId]);
                return response()->json(['status' => 'already processed'], 409);
            }

            Log::info('Processing webhook', [
                'webhook_id' => $webhookId,
                'event' => $event,
                'faculty_data' => $facultyData,
            ]);

            if ($event === 'faculty.updated') {
                $this->handleFacultyUpdate($facultyData);

                // Mark webhook as processed with 30-day expiry
                Cache::put($processedKey, true, now()->addDays(30));
            }

            Log::info('Webhook processed successfully', ['webhook_id' => $webhookId]);
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Error handling webhook:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Send outgoing webhooks to the HRIS system for faculty updates.
     *
     * @param string $event The type of event that triggered the webhook (e.g., 'faculty.updated').
     * @param array $facultyData The data related to the faculty update.
     * @return bool True if the webhook job was dispatched successfully, false otherwise.
     *
     * This method dispatches a `SendFacultyUpdateWebhook` job to handle the asynchronous sending of the webhook.
     * It logs the event and faculty data being sent.
     * It returns false if the webhook secret is not set or if there is an error dispatching the job.
     */
    public function sendFacultyWebhook($event, $facultyData)
    {
        try {
            if (!$this->webhookSecret) {
                Log::error('Cannot send webhook: Webhook secret is not set');
                return false;
            }

            Log::info('Dispatching webhook job', [
                'event' => $event,
                'faculty_data' => $facultyData,
            ]);

            SendFacultyUpdateWebhook::dispatch($event, $facultyData);
            return true;
        } catch (\Exception $e) {
            Log::error('Error dispatching webhook job:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Handle faculty updates received from the HRIS webhook.
     *
     * @param array $facultyData The data of the faculty member being updated.
     * @return bool True if the faculty was updated successfully, false otherwise.
     *
     * @throws \InvalidArgumentException If any required fields are missing from the faculty data.
     * @throws \Exception If there is an error during the database transaction.
     */
    protected function handleFacultyUpdate(array $facultyData)
    {
        try {
            return \DB::transaction(function () use ($facultyData) {
                $requiredFields = ['faculty_code', 'first_name', 'last_name', 'email', 'status', 'faculty_type'];
                foreach ($requiredFields as $field) {
                    if (!isset($facultyData[$field]) || empty($facultyData[$field])) {
                        throw new \InvalidArgumentException("Missing required field: {$field}");
                    }
                }

                $user = User::where('code', $facultyData['faculty_code'])->first();

                if (!$user) {
                    Log::error('User not found for faculty update', ['faculty_code' => $facultyData['faculty_code']]);
                    return false;
                }

                $faculty = $user->faculty;
                if (!$faculty) {
                    Log::error('Faculty record not found for user', ['user_id' => $user->id]);
                    return false;
                }

                // Update user data
                $user->update([
                    'first_name' => $facultyData['first_name'],
                    'middle_name' => $facultyData['middle_name'],
                    'last_name' => $facultyData['last_name'],
                    'suffix_name' => $facultyData['name_extension'],
                    'email' => $facultyData['email'],
                    'status' => $facultyData['status'],
                ]);

                // Update faculty data and hris_user_id if provided
                $facultyUpdateData = [
                    'faculty_type' => $facultyData['faculty_type'],
                ];

                // If HRIS sends back the UserID, update it
                if (isset($facultyData['hris_user_id'])) {
                    $facultyUpdateData['hris_user_id'] = $facultyData['hris_user_id'];
                    Log::info('Updating faculty with HRIS UserID', [
                        'faculty_code' => $facultyData['faculty_code'],
                        'hris_user_id' => $facultyData['hris_user_id'],
                    ]);
                }

                $faculty->update($facultyUpdateData);

                Log::info('Faculty updated successfully via webhook', [
                    'faculty_code' => $facultyData['faculty_code'],
                    'hris_user_id' => $faculty->hris_user_id,
                ]);

                return true;
            });
        } catch (\Exception $e) {
            Log::error('Error updating faculty:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'faculty_data' => $facultyData,
            ]);
            throw $e;
        }
    }

    /**
     * Generate an HMAC-SHA256 signature for the given payload using the webhook secret.
     *
     * @param mixed $payload The payload to sign. Can be a string or an array.
     * @return string|null The generated signature, or null if the webhook secret is not set.
     */
    protected function generateSignature($payload)
    {
        if (!$this->webhookSecret) {
            Log::error('Webhook secret is not set');
            return null;
        }

        // Convert to JSON string if not already a string
        $data = is_string($payload) ? $payload : json_encode($payload);
        Log::debug('Generating signature for payload:', ['payload' => $data]);

        $signature = hash_hmac('sha256', $data, $this->webhookSecret);
        Log::debug('Generated signature:', ['signature' => $signature]);
        return $signature;
    }

    /**
     * Verify the signature of a webhook payload.
     *
     * @param mixed $payload The payload to verify. Can be a string or an array.
     * @param string $signature The signature received in the webhook request.
     * @return bool True if the signature is valid, false otherwise.
     */
    protected function verifySignature($payload, $signature)
    {
        if (!$signature || !$this->webhookSecret) {
            Log::error('Missing signature or webhook secret');
            return false;
        }
        $expectedSignature = $this->generateSignature($payload);
        Log::debug('Signature comparison:', [
            'received' => $signature,
            'expected' => $expectedSignature,
            'secret' => $this->webhookSecret,
        ]);
        return hash_equals($expectedSignature, $signature);
    }
}
