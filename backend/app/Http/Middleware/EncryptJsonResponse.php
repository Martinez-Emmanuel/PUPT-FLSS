<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;

class EncryptJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Only encrypt successful JSON responses
        if ($response instanceof JsonResponse
            && $response->getStatusCode() >= 200
            && $response->getStatusCode() < 300) {
            $data = $response->getData(true);

            $encryptedData = Crypt::encryptString(json_encode($data));

            $response->setContent(json_encode(['encrypted' => $encryptedData]));
        }

        return $response;
    }
}
