<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UsersTableSeeder::class,
            // FacultyTableSeeder::class,
            ProgramsTableSeeder::class,
            CurriculaTableSeeder::class,
            CurriculaProgramTableSeeder::class,
            AcademicYearsTableSeeder::class,
            AcademicYearCurriculaTableSeeder::class,
            YearLevelsTableSeeder::class,
            ProgramYearLevelCurriculaTableSeeder::class,
            SemestersTableSeeder::class,
            ActiveSemestersTableSeeder::class,
            CoursesTableSeeder::class,
            CourseAssignmentsTableSeeder::class,
            CourseRequirementsTableSeeder::class,
            // PreferencesSeeder::class,
            // PreferenceDaysTableSeeder::class,
            RoomsTableSeeder::class,
            SectionsPerProgramYearTableSeeder::class,
            SectionCoursesTableSeeder::class,
            SchedulesTableSeeder::class,
            ApiKeysTableSeeder::class,
        ]);
    }
}
