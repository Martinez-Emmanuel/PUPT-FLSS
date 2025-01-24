<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CompressResponse
{
    private const MIN_SIZE = 2048;

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Check if client accepts gzip encoding
        if (!$request->headers->has('Accept-Encoding') ||
            strpos($request->headers->get('Accept-Encoding'), 'gzip') === false) {
            return $response;
        }

        // Don't compress if response is already compressed
        if ($response->headers->has('Content-Encoding')) {
            return $response;
        }

        // Only compress JSON responses
        $contentType = $response->headers->get('Content-Type');
        if (!$contentType || strpos($contentType, 'application/json') === false) {
            return $response;
        }

        $content = $response->getContent();

        // Only compress if content is larger than minimum size
        if (strlen($content) < self::MIN_SIZE) {
            return $response;
        }

        // Use a lower compression level (6) for better speed/compression balance
        $compressed = gzencode($content, 6);

        // Only use compression if it actually reduces the size
        if ($compressed === false || strlen($compressed) >= strlen($content)) {
            return $response;
        }

        $response->setContent($compressed);
        $response->headers->add([
            'Content-Encoding' => 'gzip',
            'Content-Length' => strlen($compressed),
            'Vary' => 'Accept-Encoding',
        ]);

        return $response;
    }
}
