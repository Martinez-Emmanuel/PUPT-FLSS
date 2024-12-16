<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SchedulesTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/schedules.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'schedule_id' => $record['schedule_id'],
                'section_course_id' => $record['section_course_id'],
                'day' => $record['day'] === 'NULL' ? null : $record['day'],
                'start_time' => $record['start_time'] === 'NULL' ? null : $record['start_time'],
                'end_time' => $record['end_time'] === 'NULL' ? null : $record['end_time'],
                'faculty_id' => $record['faculty_id'] === 'NULL' ? null : $record['faculty_id'],
                'room_id' => $record['room_id'] === 'NULL' ? null : $record['room_id'],
                'is_published' => $record['is_published'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('schedules')->insert($dataToInsert);
            $this->command->info('Schedules table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding schedules table: ' . $e->getMessage());
        }
    }
}
