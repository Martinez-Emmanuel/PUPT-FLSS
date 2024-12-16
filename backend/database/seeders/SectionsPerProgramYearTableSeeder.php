<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectionsPerProgramYearTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/sections_per_program_year.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'sections_per_program_year_id' => $record['sections_per_program_year_id'],
                'academic_year_id' => $record['academic_year_id'],
                'program_id' => $record['program_id'],
                'year_level' => $record['year_level'],
                'section_name' => $record['section_name'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('sections_per_program_year')->insert($dataToInsert);
            $this->command->info('Sections per program year table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding sections per program year table: ' . $e->getMessage());
        }
    }
}
