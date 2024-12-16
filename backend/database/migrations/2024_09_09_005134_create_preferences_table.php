<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preferences', function (Blueprint $table) {
            $table->bigIncrements('preferences_id');
            $table->unsignedBigInteger('faculty_id');
            $table->unsignedInteger('active_semester_id');
            $table->unsignedInteger('course_assignment_id');
            $table->timestamps();

            $table->unique(['faculty_id', 'active_semester_id', 'course_assignment_id'], 'unique_preference');
            $table->foreign('faculty_id')->references('id')->on('faculty')->onDelete('cascade');
            $table->foreign('active_semester_id')->references('active_semester_id')->on('active_semesters')->onDelete('cascade');
            $table->foreign('course_assignment_id')->references('course_assignment_id')->on('course_assignments')->onDelete('cascade');
            $table->index('faculty_id');
            $table->index('active_semester_id');
            $table->index('course_assignment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferences');
    }
};
