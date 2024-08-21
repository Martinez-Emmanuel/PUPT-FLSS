<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProgramsTable extends Migration
{
    public function up()
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->increments('program_id');
            $table->integer('curriculum_id')->unsigned()->nullable();
            $table->string('program_code', 10);
            $table->string('program_title', 100);
            $table->string('program_info', 255);
            $table->enum('status', ['active', 'inactive']);
            $table->integer('number_of_years');
            $table->foreign('curriculum_id')->references('curriculum_id')->on('curricula')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('programs');
    }
}
