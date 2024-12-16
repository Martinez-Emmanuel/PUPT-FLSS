<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseAssignmentsTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/course_assignments.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'course_assignment_id' => $record['course_assignment_id'],
                'curricula_program_id' => $record['curricula_program_id'],
                'semester_id' => $record['semester_id'],
                'course_id' => $record['course_id'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('course_assignments')->insert($dataToInsert);
            $this->command->info('Course assignments table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding course assignments table: ' . $e->getMessage());
        }
    }
}
