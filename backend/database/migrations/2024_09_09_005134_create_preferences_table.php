<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('faculty_id');
            
            $table->unsignedInteger('academic_year_id'); // Assuming this is already fixed based on previous discussions
            $table->unsignedInteger('semester_id'); // Data type is aligned with 'active_semesters'

            $table->unsignedInteger('course_id'); 
            $table->string('preferred_day');
            $table->string('preferred_time');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('faculty_id')->references('id')->on('faculty')->onDelete('cascade');
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->foreign('academic_year_id')->references('academic_year_id')->on('academic_years')->onDelete('cascade');
            $table->foreign('semester_id')->references('semester_id')->on('active_semesters')->onDelete('cascade'); // Adjusted to reference 'active_semesters'
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferences');
    }
};
