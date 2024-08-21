<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCoursesTable extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->increments('course_id');
            $table->unsignedInteger('semester_id')->nullable(); 
            $table->string('course_code', 10);
            $table->string('course_title', 100);
            $table->integer('lec_hours');
            $table->integer('lab_hours');
            $table->integer('units');
            $table->integer('tuition_hours');
            $table->timestamps();

            $table->foreign('semester_id')
                  ->references('semester_id')
                  ->on('semesters')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
}

