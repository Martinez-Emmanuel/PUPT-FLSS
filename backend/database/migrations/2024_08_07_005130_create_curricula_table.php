<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCurriculaTable extends Migration
{
    public function up()
    {
        Schema::create('curricula', function (Blueprint $table) {
            $table->increments('curriculum_id');
            $table->string('curriculum_year', 4);
            $table->enum('status', ['active', 'inactive']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('curricula');
    }
}
