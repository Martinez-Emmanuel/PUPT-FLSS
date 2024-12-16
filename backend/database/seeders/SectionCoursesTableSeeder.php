<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectionCoursesTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/section_courses.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'section_course_id' => $record['section_course_id'],
                'sections_per_program_year_id' => $record['sections_per_program_year_id'],
                'course_assignment_id' => $record['course_assignment_id'],
                'is_copy' => $record['is_copy'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('section_courses')->insert($dataToInsert);
            $this->command->info('Section courses table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding section courses table: ' . $e->getMessage());
        }
    }
}
