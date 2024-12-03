<?php

namespace App\Console\Commands;

use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckPreferencesDeadline extends Command
{
    protected $signature = 'preferences:check-deadline';
    protected $description = 'Check and disable preferences submission after deadlines (global or individual)';

    public function handle()
    {
        $today = Carbon::now()->format('Y-m-d');

        // Enable preferences and clear the global start dates
        PreferencesSetting::query()
            ->where('is_enabled', false)
            ->where('global_start_date', '<=', $today)
            ->update([
                'is_enabled' => true,
                'global_start_date' => null,
            ]);

        // Enable preferences and clear individual start dates
        PreferencesSetting::query()
            ->where('is_enabled', false)
            ->where('individual_start_date', '<=', $today)
            ->update([
                'is_enabled' => true,
                'individual_start_date' => null,
            ]);

        // Disable preferences and clear the global deadlines
        PreferencesSetting::query()
            ->where('is_enabled', true)
            ->where('global_deadline', '<', $today)
            ->update([
                'is_enabled' => false,
                'global_deadline' => null,
            ]);

        // Disable preferences and clear individual deadlines
        PreferencesSetting::query()
            ->where('is_enabled', true)
            ->where('individual_deadline', '<', $today)
            ->update([
                'is_enabled' => false,
                'individual_deadline' => null,
            ]);

        $this->info('Preferences deadline check completed successfully.');
    }
}
