<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id('schedule_id');
            $table->unsignedBigInteger('section_course_id');
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->unsignedBigInteger('room_id')->nullable();

            $table->tinyInteger('is_published')->default(0);

            $table->timestamps();

            $table->foreign('section_course_id')
                ->references('section_course_id')->on('section_courses')
                ->onDelete('cascade');

            $table->foreign('faculty_id')
                ->references('id')->on('faculty')
                ->onDelete('cascade');

            $table->foreign('room_id')
                ->references('room_id')->on('rooms')
                ->onDelete('cascade');
            $table->index('section_course_id');
            $table->index('faculty_id');
            $table->index('room_id');
            $table->index('day');
            $table->index('start_time');
            $table->index('end_time');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
