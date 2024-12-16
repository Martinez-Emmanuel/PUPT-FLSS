<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicYearCurriculaTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/academic_year_curricula.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'academic_year_curricula_id' => $record['academic_year_curricula_id'],
                'academic_year_id' => $record['academic_year_id'],
                'curriculum_id' => $record['curriculum_id'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('academic_year_curricula')->insert($dataToInsert);
            $this->command->info('Academic year curricula table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding academic year curricula table: ' . $e->getMessage());
        }
    }
}
