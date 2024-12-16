<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateApiKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:generate-key {--length=64}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a random API key';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $length = $this->option('length');

        if (!is_numeric($length) || $length <= 0) {
            $this->error('Invalid length. Length must be a positive integer.');
            return 1;
        }

        // Generate the random key
        $key = Str::random($length);

        $this->info("Generated API key ({$length} characters):");
        $this->line($key);

        return 0;
    }
}
