<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_assignments', function (Blueprint $table) {
            $table->increments('course_assignment_id');
            $table->unsignedInteger('curricula_program_id');
            $table->unsignedInteger('semester_id');
            $table->unsignedInteger('course_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('curricula_program_id')
                ->references('curricula_program_id')
                ->on('curricula_program')
                ->onDelete('cascade')
                ->onUpdate('restrict');

            $table->foreign('semester_id')
                ->references('semester_id')
                ->on('semesters')
                ->onDelete('cascade')
                ->onUpdate('restrict');

            $table->foreign('course_id')
                ->references('course_id')
                ->on('courses')
                ->onDelete('cascade')
                ->onUpdate('restrict');
            $table->index('curricula_program_id');
            $table->index('semester_id');
            $table->index('course_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_assignments');
    }
};
