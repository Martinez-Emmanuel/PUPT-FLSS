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
        $today = Carbon::now('Asia/Manila');

        // Enable preferences IF NOT ALREADY ENABLED and it's past the global start date
        PreferencesSetting::query()
            ->where('is_enabled', false)
            ->whereDate('global_start_date', '<=', $today->copy()->startOfDay())
            ->whereNotNull('global_start_date') // Add this condition
            ->update([
                'is_enabled' => true,
            ]);

        // Enable preferences IF NOT ALREADY ENABLED and it's past the individual start date
        PreferencesSetting::query()
            ->where('is_enabled', false)
            ->whereDate('individual_start_date', '<=', $today->copy()->startOfDay())
            ->whereNotNull('individual_start_date') // Add this condition
            ->update([
                'is_enabled' => true,
            ]);

        // Disable preferences and clear the global deadlines
        PreferencesSetting::query()
            ->where('is_enabled', true)
            ->whereDate('global_deadline', '<', $today)
            ->update([
                'is_enabled' => false,
                'global_deadline' => null,
            ]);

        // Disable preferences and clear individual deadlines
        PreferencesSetting::query()
            ->where('is_enabled', true)
            ->whereDate('individual_deadline', '<', $today)
            ->update([
                'is_enabled' => false,
                'individual_deadline' => null,
            ]);

        $this->info('Preferences deadline check completed successfully.');
    }
}
