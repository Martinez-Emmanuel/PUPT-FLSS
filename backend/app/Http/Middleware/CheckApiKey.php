<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use App\Models\ApiKey;

class CheckApiKey
{
    /**
     * Validates API key from X-API-Key header against database configuration.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @param  string  $system System identifier for API key configuration
     * @return Response|mixed
     */
    public function handle(Request $request, Closure $next, string $system)
    {
        try {
            // Sanitize and validate system parameter
            $system = trim($system);
            if (empty($system)) {
                Log::error('API Key middleware: Empty system parameter provided');
                return $this->errorResponse('Invalid system configuration', 500);
            }

            // Get and validate API key from header
            $apiKey = $request->header('X-API-Key');
            if (empty($apiKey)) {
                Log::warning('API Key middleware: Missing API key header', [
                    'ip' => $request->ip(),
                    'path' => $request->path(),
                    'system' => $system,
                ]);
                return $this->errorResponse('API key is required', 401);
            }

            // Get expected API key from database
            $apiKeyRecord = ApiKey::where('system', $system)->where('is_active', true)->first();

            // Check if API key is configured and active
            if (!$apiKeyRecord) {
                Log::error('API Key middleware: Missing or inactive API key configuration', [
                    'system' => $system,
                ]);
                return $this->errorResponse('API key configuration error', 500);
            }

            // Validate API key
            if (!hash_equals($apiKeyRecord->key, $apiKey)) {
                Log::warning('API Key middleware: Invalid API key used', [
                    'ip' => $request->ip(),
                    'path' => $request->path(),
                    'system' => $system,
                ]);
                return $this->errorResponse('Invalid API key', 403);
            }

            return $next($request);

        } catch (\Exception $e) {
            Log::error('API Key middleware: Unexpected error', [
                'error' => $e->getMessage(),
                'system' => $system ?? 'unknown',
                'path' => $request->path(),
            ]);
            return $this->errorResponse('Internal server error', 500);
        }
    }

    /**
     * Returns a standardized JSON error response
     *
     * @param string $message
     * @param int $status
     * @return Response
     */
    private function errorResponse(string $message, int $status): Response
    {
        return response()->json([
            'error' => true,
            'message' => $message,
        ], $status);
    }
}
