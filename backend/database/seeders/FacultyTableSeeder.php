<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacultyTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/faculty.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'id' => $record['id'],
                'user_id' => $record['user_id'],
                'faculty_type' => $record['faculty_type'],
                'faculty_units' => $record['faculty_units'],
                'created_at' => $record['created_at'] ?? null,
                'updated_at' => $record['updated_at'] ?? null,
            ];
        }

        try {
            DB::table('faculty')->insert($dataToInsert);
            $this->command->info('Faculty table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding faculty table: ' . $e->getMessage());
        }
    }
}
