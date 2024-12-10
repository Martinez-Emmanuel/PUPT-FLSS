<?php

namespace App\Console\Commands;

use App\Models\ApiKey;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;

class AddApiKey extends Command
{
    protected $signature = 'api:add-key {system} {key?} {--active} {--inactive}';
    protected $description = 'Add an API key to the database or update an existing one';

    public function handle()
    {
        if (!$this->validateInput()) {
            return 1;
        }

        $system = $this->argument('system');
        $key = $this->argument('key');
        $active = $this->option('active');
        $inactive = $this->option('inactive');

        try {
            DB::beginTransaction();

            if (empty($key)) {
                $this->info("No API key provided. Nothing to add or update.");
                DB::commit();
                return 0;
            }

            // Find existing key by decrypting and comparing
            $existingKey = $this->findExistingKey($system, $key);

            if ($existingKey) {
                if ($active || $inactive) {
                    $newStatus = $this->updateKeyStatus($system, $existingKey, $active);
                    $this->info("API key for system '{$system}' updated to " . ($newStatus ? 'active' : 'inactive') . ".");
                } else {
                    $this->error("This exact API key already exists for the system '{$system}'.");
                    DB::rollBack();
                    return 1;
                }
            } else {
                // Add new key (always inactive by default unless --active is specified)
                $this->addNewKey($system, $key, $active);
                $this->info("New API key added successfully for system '{$system}' and set to " . ($active ? 'active' : 'inactive') . ".");
            }

            DB::commit();
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    private function validateInput(): bool
    {
        $key = $this->argument('key');
        $active = $this->option('active');
        $inactive = $this->option('inactive');

        if ($active && $inactive) {
            $this->error('Cannot use --active and --inactive options at the same time.');
            return false;
        }

        if (empty($key) && ($active || $inactive)) {
            $this->error('The --active or --inactive options can only be used when providing an API key.');
            return false;
        }

        if (!empty($key)) {
            $validator = Validator::make(
                [
                    'system' => $this->argument('system'),
                    'key' => $key,
                ],
                [
                    'system' => 'required|string',
                    'key' => ['required', 'string', 'min:64'],
                ]
            );

            if ($validator->fails()) {
                $this->error('Invalid input:');
                foreach ($validator->errors()->all() as $error) {
                    $this->error($error);
                }
                $this->info("\nTip: You can generate a secure API key using the command:");
                $this->info("php artisan api:generate-key");
                return false;
            }
        }

        return true;
    }

    private function findExistingKey(string $system, string $key): ?ApiKey
    {
        $keys = ApiKey::where('system', $system)->get();

        foreach ($keys as $existingKey) {
            try {
                $decryptedKey = Crypt::decryptString($existingKey->encrypted_key);
                if ($decryptedKey === $key) {
                    return $existingKey;
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        return null;
    }

    private function updateKeyStatus(string $system, ApiKey $apiKey, bool $setActive): bool
    {
        if ($setActive) {
            // First, set all keys for this system as inactive
            ApiKey::where('system', $system)->update(['is_active' => false]);
        }

        // Update the status of the specific key
        $apiKey->is_active = $setActive;
        $apiKey->save();

        return $apiKey->is_active;
    }

    private function addNewKey(string $system, string $key, bool $setActive): void
    {
        if ($setActive) {
            // If adding a new active key, set all existing keys to inactive
            ApiKey::where('system', $system)->update(['is_active' => false]);
        }

        // Add the new key (inactive by default unless --active is specified)
        ApiKey::create([
            'system' => $system,
            'key' => $key,
            'is_active' => $setActive,
        ]);
    }
}