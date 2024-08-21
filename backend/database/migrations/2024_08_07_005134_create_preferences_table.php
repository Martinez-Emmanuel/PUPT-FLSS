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
            $table->unsignedBigInteger('course_id');
            $table->string('preferred_day');
            $table->string('preferred_time');
            $table->timestamps();

            $table->foreign('faculty_id')->references('id')->on('faculty')->onDelete('cascade');
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade'); // Adjusted to match Course model
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferences');
    }
};

