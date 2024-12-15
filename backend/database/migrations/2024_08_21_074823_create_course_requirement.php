<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_requirements', function (Blueprint $table) {
            $table->increments('requirement_id');
            $table->unsignedInteger('course_id')->nullable();
            $table->enum('requirement_type', ['pre', 'co']);
            $table->unsignedInteger('required_course_id')->nullable();
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->foreign('required_course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->index('course_id');
            $table->index('required_course_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_requirements');
    }
};
