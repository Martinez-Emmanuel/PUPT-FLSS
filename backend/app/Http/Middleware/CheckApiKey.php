<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $system
     * @return \Illuminate\Http\Response|mixed
     */
    public function handle(Request $request, Closure $next, string $system)
    {
        $apiKey = $request->header('X-API-Key');
        $expectedApiKey = env(strtoupper($system) . '_API_KEY');

        if ($apiKey !== $expectedApiKey) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
