<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculaProgramTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/curricula_program.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'curricula_program_id' => $record['curricula_program_id'],
                'curriculum_id' => $record['curriculum_id'],
                'program_id' => $record['program_id'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('curricula_program')->insert($dataToInsert);
            $this->command->info('Curricula program table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding curricula program table: ' . $e->getMessage());
        }
    }
}
