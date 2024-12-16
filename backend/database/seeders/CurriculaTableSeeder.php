<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculaTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/curricula.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'curriculum_id' => $record['curriculum_id'],
                'curriculum_year' => $record['curriculum_year'],
                'status' => $record['status'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('curricula')->insert($dataToInsert);
            $this->command->info('Curricula table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding curricula table: ' . $e->getMessage());
        }
    }
}
