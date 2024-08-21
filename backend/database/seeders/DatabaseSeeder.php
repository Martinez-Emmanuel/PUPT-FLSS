<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        $this->call([
            FacultySeeder::class,
            CurriculaTableSeeder::class,
            ProgramsTableSeeder::class,
            YearLevelSeeder::class,
            SemestersTableSeeder::class,
            CoursesTableSeeder::class,
            CourseReqTableSeeder::class,
        ]);
    }
}
