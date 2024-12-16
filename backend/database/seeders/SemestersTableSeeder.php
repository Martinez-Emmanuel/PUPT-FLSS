<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SemestersTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/semesters.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'semester_id' => $record['semester_id'],
                'year_level_id' => $record['year_level_id'],
                'semester' => $record['semester'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('semesters')->insert($dataToInsert);
            $this->command->info('Semesters table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding semesters table: ' . $e->getMessage());
        }
    }
}
