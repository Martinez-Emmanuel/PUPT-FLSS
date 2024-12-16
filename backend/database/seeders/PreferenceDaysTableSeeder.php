<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferenceDaysTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/preference_days.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'preference_day_id' => $record['preference_day_id'],
                'preference_id' => $record['preference_id'],
                'preferred_day' => $record['preferred_day'],
                'preferred_start_time' => $record['preferred_start_time'],
                'preferred_end_time' => $record['preferred_end_time'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('preference_days')->insert($dataToInsert);
            $this->command->info('Preference days table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding preference days table: ' . $e->getMessage());
        }
    }
}
