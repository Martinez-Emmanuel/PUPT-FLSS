<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramsTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/programs.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'program_id' => $record['program_id'],
                'program_code' => $record['program_code'],
                'program_title' => $record['program_title'],
                'program_info' => $record['program_info'],
                'number_of_years' => $record['number_of_years'],
                'status' => $record['status'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('programs')->insert($dataToInsert);
            $this->command->info('Programs table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding programs table: ' . $e->getMessage());
        }
    }
}
