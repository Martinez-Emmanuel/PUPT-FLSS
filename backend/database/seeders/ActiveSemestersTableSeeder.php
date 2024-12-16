<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActiveSemestersTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/active_semesters.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'active_semester_id' => $record['active_semester_id'],
                'academic_year_id' => $record['academic_year_id'],
                'semester_id' => $record['semester_id'],
                'is_active' => $record['is_active'],
                'start_date' => $record['start_date'],
                'end_date' => $record['end_date'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('active_semesters')->insert($dataToInsert);
            $this->command->info('Active semesters table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding active semesters table: ' . $e->getMessage());
        }
    }
}
