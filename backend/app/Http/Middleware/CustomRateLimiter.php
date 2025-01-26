<?php

namespace App\Http\Middleware;

use App\Services\RateLimiterService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomRateLimiter
{
    protected $limiter;

    public function __construct(RateLimiterService $limiter)
    {
        $this->limiter = $limiter;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        $key = $this->generateKey($request);

        $this->limiter->cleanup($key);

        if ($this->limiter->tooManyAttempts($key, $type)) {
            $response = response()->json([
                'message' => $this->limiter->getBlockMessage($key),
                'retry_after' => $this->limiter->availableIn($key),
            ], 429);

            return $this->addHeaders(
                $response,
                $key,
                $type,
                true
            );
        }

        $response = $next($request);

        if (in_array($response->getStatusCode(), [401, 403])) {
            $this->limiter->hit($key, $type);
        }

        return $this->addHeaders($response, $key, $type);
    }

    /**
     * Add rate limit headers to the response.
     */
    protected function addHeaders(Response $response, string $key, string $type, bool $locked = false): Response
    {
        $response->headers->add([
            'X-RateLimit-Limit' => $this->limiter->maxAttempts($type),
            'X-RateLimit-Remaining' => $locked ? 0 : $this->limiter->remaining($key, $type),
            'X-RateLimit-Reset' => $locked ? time() + $this->limiter->availableIn($key) : time() + ($this->limiter->decayMinutes($type) * 60),
        ]);

        if ($locked) {
            $response->headers->add([
                'Retry-After' => $this->limiter->availableIn($key),
            ]);
        }

        return $response;
    }

    /**
     * Generate a unique key for rate limiting.
     */
    protected function generateKey(Request $request): string
    {
        return sha1(implode('|', [
            $request->ip(),
            $request->header('User-Agent', ''),
            $request->input('email', ''),
        ]));
    }
}
