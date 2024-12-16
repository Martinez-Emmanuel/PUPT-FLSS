<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicYearsTableSeeder extends Seeder
{
    public function run()
    {
        // 1. Path to the CSV file
        $csvPath = database_path('seeders/csv/academic_years.csv');

        // 2. Convert CSV to array
        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'academic_year_id' => $record['academic_year_id'],
                'year_start' => $record['year_start'],
                'year_end' => $record['year_end'],
                'is_active' => $record['is_active'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        // 3. Insert into the table
        try {
            DB::table('academic_years')->insert($dataToInsert);
            $this->command->info('Academic years table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding academic years table: ' . $e->getMessage());
        }
    }
}
