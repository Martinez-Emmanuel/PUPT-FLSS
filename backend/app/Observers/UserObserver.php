<?php

namespace App\Observers;

use App\Models\PreferencesSetting;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        if ($user->wasChanged('status')) {
            try {
                // Get associated faculty if exists
                $faculty = $user->faculty;

                if (!$faculty) {
                    return;
                }

                if ($user->status === 'Active') {
                    // If user became active, create preference settings if global settings exist
                    $existingSettings = PreferencesSetting::whereNotNull('global_start_date')
                        ->whereNotNull('global_deadline')
                        ->first();

                    PreferencesSetting::firstOrCreate(
                        ['faculty_id' => $faculty->id],
                        [
                            'is_enabled' => $existingSettings ? $existingSettings->is_enabled : false,
                            'global_start_date' => $existingSettings ? $existingSettings->global_start_date : null,
                            'global_deadline' => $existingSettings ? $existingSettings->global_deadline : null,
                            'individual_start_date' => null,
                            'individual_deadline' => null,
                            'has_request' => 0,
                        ]
                    );

                    Log::info('Preferences settings created for newly activated faculty', [
                        'faculty_id' => $faculty->id,
                        'user_id' => $user->id,
                        'has_global_settings' => (bool) $existingSettings,
                    ]);
                } else {
                    // If user became inactive, delete their preference settings
                    $deleted = PreferencesSetting::where('faculty_id', $faculty->id)->delete();

                    Log::info('Preferences settings deleted for deactivated faculty', [
                        'faculty_id' => $faculty->id,
                        'user_id' => $user->id,
                        'settings_deleted' => (bool) $deleted,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error handling faculty preference settings after user status change', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
