<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckHmac
{
    /**
     * Constants for HMAC configuration
     */
    private const TIMESTAMP_WINDOW = 300;
    private const HASH_ALGORITHM = 'sha256';
    private const NONCE_CACHE_PREFIX = 'hmac_nonce:';
    private const NONCE_EXPIRY_MINUTES = 5;

    /**
     * Validates HMAC signature from headers against database configuration and request data.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @param  string  $system System identifier for API key configuration
     * @return Response|mixed
     */
    public function handle(Request $request, Closure $next, string $system)
    {
        try {
            // Validate system parameter
            if (!$this->validateSystem($system)) {
                return $this->errorResponse('Invalid system configuration', 500);
            }

            // Get API key configuration
            $apiKeyRecord = $this->getApiKeyRecord($system);
            if (!$apiKeyRecord) {
                return $this->errorResponse('API key configuration error', 500);
            }

            // Validate request headers
            $validationResponse = $this->validateRequestHeaders($request);
            if ($validationResponse) {
                return $validationResponse;
            }

            // Get headers
            $signature = $request->header('X-HMAC-Signature');
            $timestamp = $request->header('X-HMAC-Timestamp');
            $nonce = $request->header('X-HMAC-Nonce');

            // Validate timestamp
            if (!$this->isTimestampValid($timestamp)) {
                return $this->errorResponse('HMAC timestamp expired', 401);
            }

            // Validate nonce if provided
            if ($nonce) {
                $nonceValidation = $this->validateNonce($nonce);
                if ($nonceValidation) {
                    return $nonceValidation;
                }
            }

            // Validate HMAC signature
            if (!$this->isSignatureValid($request, $signature, $timestamp, $nonce, $apiKeyRecord->key)) {
                return $this->errorResponse('Invalid HMAC signature', 403);
            }

            return $next($request);

        } catch (\Exception $e) {
            Log::error('HMAC middleware: Unexpected error', [
                'error' => $e->getMessage(),
                'system' => $system ?? 'unknown',
                'path' => $request->path(),
            ]);
            return $this->errorResponse('Internal server error', 500);
        }
    }

    /**
     * Validates the system parameter
     */
    private function validateSystem(string $system): bool
    {
        return !empty(trim($system));
    }

    /**
     * Gets the API key record from database
     */
    private function getApiKeyRecord(string $system)
    {
        return ApiKey::where('system', $system)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Validates required request headers
     */
    private function validateRequestHeaders(Request $request): ?Response
    {
        $signature = $request->header('X-HMAC-Signature');
        $timestamp = $request->header('X-HMAC-Timestamp');

        if (empty($signature) || empty($timestamp)) {
            Log::warning('HMAC middleware: Missing HMAC headers', [
                'ip' => $request->ip(),
                'path' => $request->path(),
            ]);
            return $this->errorResponse('HMAC signature and timestamp are required', 401);
        }

        return null;
    }

    /**
     * Validates if timestamp is within acceptable window
     */
    private function isTimestampValid(int $timestamp): bool
    {
        return abs(time() - $timestamp) <= self::TIMESTAMP_WINDOW;
    }

    /**
     * Validates nonce to prevent replay attacks
     */
    private function validateNonce(string $nonce): ?Response
    {
        $nonceKey = self::NONCE_CACHE_PREFIX . $nonce;

        if (Cache::has($nonceKey)) {
            Log::warning('HMAC middleware: Nonce reuse attempt', [
                'nonce' => $nonce,
            ]);
            return $this->errorResponse('Nonce already used', 401);
        }

        Cache::put($nonceKey, true, now()->addMinutes(self::NONCE_EXPIRY_MINUTES));
        return null;
    }

    /**
     * Validates HMAC signature
     */
    private function isSignatureValid(Request $request, string $signature, int $timestamp, ?string $nonce, string $key): bool
    {
        $message = $this->constructMessage($request, $timestamp, $nonce);
        $expectedSignature = hash_hmac(self::HASH_ALGORITHM, $message, $key);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Constructs the message for HMAC signing
     */
    private function constructMessage(Request $request, int $timestamp, ?string $nonce): string
    {
        return implode('|', [
            $request->method(),
            $request->fullUrl(),
            $request->getContent(),
            $timestamp,
            $nonce ?? '',
        ]);
    }

    /**
     * Returns a standardized JSON error response
     */
    private function errorResponse(string $message, int $status): Response
    {
        return response()->json([
            'error' => true,
            'message' => $message,
        ], $status);
    }
}
