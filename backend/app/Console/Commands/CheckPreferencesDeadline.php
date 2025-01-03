<?php

namespace App\Console\Commands;

use App\Models\PreferencesSetting;
use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Jobs\NotifyFacultyDeadlineSingleJob;
use Illuminate\Support\Facades\Log;
use App\Jobs\NotifyGlobalFacultyDeadlineJob;

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


        $tomorrow = Carbon::now('Asia/Manila')->addDay()->startOfDay();

        $faculties = PreferencesSetting::with('faculty.user')
            ->whereNotNull('individual_deadline')
            ->whereDate('individual_deadline', $tomorrow)
            ->get();

        if ($faculties->isEmpty()) {
            $this->info('No faculty members have deadlines in the next 24 hours.');
        } else {
            foreach ($faculties as $preference) {
                if ($preference->faculty && $preference->faculty->user) {
                    NotifyFacultyDeadlineSingleJob::dispatch($preference->faculty);
                    Log::info("Notification dispatched for faculty ID: {$preference->faculty->id}");
                }
            }
            $this->info('✅ Faculty deadline notifications dispatched successfully.');
        }

        // Check for global deadline
        $globalSettings = PreferencesSetting::whereNotNull('global_deadline')
            ->whereDate('global_deadline', $today->copy()->addDay()->startOfDay())
            ->get();

        if ($globalSettings->isEmpty()) {
            Log::info('✅ No faculties have global deadlines in the next 24 hours.');
            $this->info('✅ No faculties have global deadlines in the next 24 hours.');
            return;
        }

        foreach ($globalSettings as $setting) {
            if ($setting->faculty && $setting->faculty->user) {
                NotifyGlobalFacultyDeadlineJob::dispatch($setting->faculty);
                Log::info("✅ Global notification dispatched for faculty ID: {$setting->faculty->id}");
            }
        }

        $this->info('✅ Global faculty deadline notifications dispatched successfully.');
    }
}
