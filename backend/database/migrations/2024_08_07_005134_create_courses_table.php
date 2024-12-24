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
            $table->string('course_code', 50);
            $table->string('course_title', 100);
            $table->integer('lec_hours');
            $table->integer('lab_hours');
            $table->integer('units');
            $table->integer('tuition_hours');
            $table->index('course_code');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
}
