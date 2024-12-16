<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferencesSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/preferences.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'preferences_id' => $record['preferences_id'],
                'faculty_id' => $record['faculty_id'],
                'active_semester_id' => $record['active_semester_id'],
                'course_assignment_id' => $record['course_assignment_id'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('preferences')->insert($dataToInsert);
            $this->command->info('Preferences table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding preferences table: ' . $e->getMessage());
        }
    }
}
