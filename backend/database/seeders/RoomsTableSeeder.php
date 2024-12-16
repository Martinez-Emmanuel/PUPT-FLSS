<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomsTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/rooms.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'room_id' => $record['room_id'],
                'room_code' => $record['room_code'],
                'location' => $record['location'],
                'floor_level' => $record['floor_level'],
                'room_type' => $record['room_type'],
                'capacity' => $record['capacity'],
                'status' => $record['status'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('rooms')->insert($dataToInsert);
            $this->command->info('Rooms table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding rooms table: ' . $e->getMessage());
        }
    }
}
