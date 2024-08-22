<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('course_assignments', function (Blueprint $table) {
            $table->increments('course_assignment_id');
            $table->unsignedInteger('program_id'); 
            $table->unsignedInteger('semester_id');
            $table->unsignedInteger('course_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('program_id')
                  ->references('program_id')
                  ->on('programs')
                  ->onDelete('cascade');

            $table->foreign('semester_id')
                  ->references('semester_id')
                  ->on('semesters')
                  ->onDelete('cascade');
            
            $table->foreign('course_id')
                  ->references('course_id')
                  ->on('courses')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_assignments');
    }
};
