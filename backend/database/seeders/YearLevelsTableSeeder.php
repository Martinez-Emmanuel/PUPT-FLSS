<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class YearLevelsTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/year_levels.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'year_level_id' => $record['year_level_id'],
                'curricula_program_id' => $record['curricula_program_id'],
                'year' => $record['year'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('year_levels')->insert($dataToInsert);
            $this->command->info('Year levels table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding year levels table: ' . $e->getMessage());
        }
    }
}
