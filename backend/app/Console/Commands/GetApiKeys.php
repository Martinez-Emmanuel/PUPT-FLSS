<?php

namespace App\Console\Commands;

use App\Models\ApiKey;
use Illuminate\Console\Command;

class GetApiKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:get-keys {system}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get API keys for a system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $system = $this->argument('system');

        // Get all API keys for the system, ordered by active first
        $apiKeys = ApiKey::where('system', $system)
            ->orderBy('is_active', 'desc')
            ->get();

        if ($apiKeys->isEmpty()) {
            $this->info("No API keys found for system '{$system}'.");
            return 0;
        }

        $this->info("API keys for system '{$system}':");

        $headers = ['Key', 'Status', 'Created At', 'Updated At'];
        $rows = $apiKeys->map(function ($apiKey) {
            return [
                $apiKey->key,
                $apiKey->is_active ? 'Active' : 'Inactive',
                $apiKey->created_at,
                $apiKey->updated_at,
            ];
        });

        $this->table($headers, $rows);

        return 0;
    }
}
