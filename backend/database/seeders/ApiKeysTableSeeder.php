<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApiKeysTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/api_keys.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'api_keys_id' => $record['api_keys_id'],
                'system' => $record['system'],
                'encrypted_key' => $record['encrypted_key'],
                'is_active' => $record['is_active'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('api_keys')->insert($dataToInsert);
            $this->command->info('API keys table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding API keys table: ' . $e->getMessage());
        }
    }
}
