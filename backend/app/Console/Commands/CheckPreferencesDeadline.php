<?php

namespace App\Console\Commands;

use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckPreferencesDeadline extends Command
{
    protected $signature = 'preferences:check-deadline';
    protected $description = 'Check and disable preferences submission after deadline';

    public function handle()
    {
        $today = Carbon::now()->format('Y-m-d');

        PreferencesSetting::query()
            ->where('is_enabled', true)
            ->where('global_deadline', '<', $today)
            ->update([
                'is_enabled' => false,
                'global_deadline' => null,
            ]);

        $this->info('Preferences deadline check completed successfully.');
    }
}
