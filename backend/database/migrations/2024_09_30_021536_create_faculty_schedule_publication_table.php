<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFacultySchedulePublicationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('faculty_schedule_publication', function (Blueprint $table) {
            $table->bigIncrements('faculty_schedule_publication_id');
            $table->unsignedBigInteger('faculty_id');
            $table->unsignedBigInteger('schedule_id');
            $table->boolean('is_published')->default(0);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('faculty_id')->references('id')->on('faculty')->onDelete('cascade');
            $table->foreign('schedule_id')->references('schedule_id')->on('schedules')->onDelete('cascade');
            $table->index('faculty_id');
            $table->index('schedule_id');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('faculty_schedule_publication');
    }
}
