<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RestructureFacultySchedulePublicationTable extends Migration
{
    public function up()
    {
        Schema::dropIfExists('faculty_schedule_publication');

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
    }

    public function down()
    {
        Schema::dropIfExists('faculty_schedule_publication');
    }
}
