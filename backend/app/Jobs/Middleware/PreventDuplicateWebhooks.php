<?php

namespace App\Jobs\Middleware;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PreventDuplicateWebhooks
{
    protected $key;

    public function __construct(string $key)
    {
        $this->key = $key;
    }

    public function handle($job, $next)
    {
        if (Cache::has($this->key)) {
            Log::info('Skipping duplicate webhook job', [
                'key' => $this->key,
            ]);
            return;
        }

        // Process the job
        $next($job);
    }
}
