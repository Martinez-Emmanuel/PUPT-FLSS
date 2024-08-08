<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('preferences', function (Blueprint $table) {
            $table->id('preference_id');
            $table->unsignedBigInteger('faculty_id');
            $table->unsignedBigInteger('course_id');
            $table->string('preferred_day');
            $table->string('preferred_time');
            $table->foreign('faculty_id')->references('faculty_id')->on('faculties')->onDelete('cascade');
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferences');
    }
};


