<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoursesTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/courses.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'course_id' => $record['course_id'],
                'course_code' => $record['course_code'],
                'course_title' => $record['course_title'],
                'lec_hours' => $record['lec_hours'],
                'lab_hours' => $record['lab_hours'],
                'units' => $record['units'],
                'tuition_hours' => $record['tuition_hours'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('courses')->insert($dataToInsert);
            $this->command->info('Courses table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding courses table: ' . $e->getMessage());
        }
    }
}
