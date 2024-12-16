<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramYearLevelCurriculaTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/program_year_level_curricula.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'program_year_level_curricula_id' => $record['program_year_level_curricula_id'],
                'academic_year_id' => $record['academic_year_id'],
                'program_id' => $record['program_id'],
                'year_level' => $record['year_level'],
                'curriculum_id' => $record['curriculum_id'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('program_year_level_curricula')->insert($dataToInsert);
            $this->command->info('Program year level curricula table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding program year level curricula table: ' . $e->getMessage());
        }
    }
}
