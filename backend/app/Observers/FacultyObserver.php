<?php

namespace App\Observers;

use App\Models\Faculty;
use App\Models\PreferencesSetting;
use Illuminate\Support\Facades\Log;

class FacultyObserver
{
    /**
     * Handle the Faculty "created" event.
     */
    public function created(Faculty $faculty): void
    {
        try {
            if (!$faculty->relationLoaded('user')) {
                $faculty->load('user');
            }

            // Skip if faculty's user is inactive
            if (!$faculty->user || $faculty->user->status !== 'Active') {
                Log::info('Skipping preferences settings creation for inactive faculty', [
                    'faculty_id' => $faculty->id,
                    'user_id' => $faculty->user?->id,
                ]);
                return;
            }

            // Find existing faculty with global settings
            $existingSettings = PreferencesSetting::whereNotNull('global_start_date')
                ->whereNotNull('global_deadline')
                ->first();

            // Create new preference settings for the faculty
            PreferencesSetting::create([
                'faculty_id' => $faculty->id,
                'is_enabled' => $existingSettings ? $existingSettings->is_enabled : false,
                'global_start_date' => $existingSettings ? $existingSettings->global_start_date : null,
                'global_deadline' => $existingSettings ? $existingSettings->global_deadline : null,
                'individual_start_date' => null,
                'individual_deadline' => null,
                'has_request' => 0,
            ]);

            Log::info('Preferences settings created for new faculty', [
                'faculty_id' => $faculty->id,
                'has_global_settings' => (bool) $existingSettings,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create preferences settings for new faculty', [
                'faculty_id' => $faculty->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
