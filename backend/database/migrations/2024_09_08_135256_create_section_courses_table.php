<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_courses', function (Blueprint $table) {
            $table->bigIncrements('section_course_id');
            $table->unsignedBigInteger('sections_per_program_year_id');
            $table->unsignedInteger('course_assignment_id');
            $table->tinyInteger('is_copy')->default(0);
            $table->timestamps();

            $table->foreign('sections_per_program_year_id')
                ->references('sections_per_program_year_id')->on('sections_per_program_year')
                ->onDelete('cascade');

            $table->foreign('course_assignment_id')
                ->references('course_assignment_id')->on('course_assignments')
                ->onDelete('cascade');
            $table->index('sections_per_program_year_id');
            $table->index('course_assignment_id');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('section_courses');
    }
};
