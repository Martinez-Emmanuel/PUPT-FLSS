<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RestructureFacultySchedulePublicationTable extends Migration
{
    public function up()
    {
        // First, clean up any leftover tables from failed migrations
        Schema::dropIfExists('temp_faculty_publications');
        if (Schema::hasTable('faculty_schedule_publication_backup')) {
            Schema::dropIfExists('faculty_schedule_publication');
            Schema::rename('faculty_schedule_publication_backup', 'faculty_schedule_publication');
        }

        // Now start the actual migration
        if (!Schema::hasTable('faculty_schedule_publication')) {
            Log::error('Original faculty_schedule_publication table does not exist');
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            // Get the existing data first
            $existingData = DB::table('faculty_schedule_publication AS fsp')
                ->select(
                    'fsp.faculty_id',
                    'spy.academic_year_id',
                    'ca.semester_id',
                    'fsp.is_published',
                    'fsp.created_at',
                    'fsp.updated_at'
                )
                ->join('schedules AS s', 's.schedule_id', '=', 'fsp.schedule_id')
                ->join('section_courses AS sc', 'sc.section_course_id', '=', 's.section_course_id')
                ->join('sections_per_program_year AS spy', 'spy.sections_per_program_year_id', '=', 'sc.sections_per_program_year_id')
                ->join('course_assignments AS ca', 'ca.course_assignment_id', '=', 'sc.course_assignment_id')
                ->distinct()
                ->get();

            // Create temporary table
            Schema::create('temp_faculty_publications', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('faculty_id');
                $table->unsignedInteger('academic_year_id');
                $table->unsignedInteger('semester_id');
                $table->boolean('is_published')->default(false);
                $table->timestamps();
            });

            // Insert the data into temporary table
            foreach ($existingData as $record) {
                DB::table('temp_faculty_publications')->insert((array)$record);
            }

            // Backup old table
            Schema::rename('faculty_schedule_publication', 'faculty_schedule_publication_backup');

            // Create new table
            Schema::create('faculty_schedule_publication', function (Blueprint $table) {
                $table->bigIncrements('faculty_schedule_publication_id');
                $table->unsignedBigInteger('faculty_id');
                $table->unsignedInteger('academic_year_id');
                $table->unsignedInteger('semester_id');
                $table->boolean('is_published')->default(false);
                $table->timestamps();

                $table->index('faculty_id');
                $table->index('academic_year_id');
                $table->index('semester_id');
                $table->index('is_published');

                $table->unique(['faculty_id', 'academic_year_id', 'semester_id'], 'unique_faculty_publication');

                $table->foreign('faculty_id')->references('id')->on('faculty')->onDelete('cascade');
                $table->foreign('academic_year_id')->references('academic_year_id')->on('academic_years')->onDelete('cascade');
                $table->foreign('semester_id')->references('semester_id')->on('semesters')->onDelete('cascade');
            });

            // Move data from temporary to new table
            DB::table('faculty_schedule_publication')->insertUsing(
                ['faculty_id', 'academic_year_id', 'semester_id', 'is_published', 'created_at', 'updated_at'],
                DB::table('temp_faculty_publications')
                    ->select('faculty_id', 'academic_year_id', 'semester_id', 'is_published', 'created_at', 'updated_at')
            );

            // Verify data
            $oldCount = DB::table('faculty_schedule_publication_backup')->count();
            $newCount = DB::table('faculty_schedule_publication')->count();
            
            if ($newCount === 0 && $oldCount > 0) {
                throw new \Exception("Data migration failed - new table is empty while old table had $oldCount records");
            }

            Log::info("Migration completed. Old records: $oldCount, New records: $newCount");

            // Clean up
            Schema::dropIfExists('temp_faculty_publications');
            Schema::dropIfExists('faculty_schedule_publication_backup');

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

        } catch (\Exception $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            
            // Cleanup and restore on failure
            Schema::dropIfExists('temp_faculty_publications');
            if (Schema::hasTable('faculty_schedule_publication_backup')) {
                Schema::dropIfExists('faculty_schedule_publication');
                Schema::rename('faculty_schedule_publication_backup', 'faculty_schedule_publication');
            }
            
            Log::error('Faculty publication migration failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function down()
    {
        // Nothing to do in down() as we can't restore the schedule_id relationship
        Schema::dropIfExists('faculty_schedule_publication');
    }
} 