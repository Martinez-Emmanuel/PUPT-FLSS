<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSemestersTable extends Migration
{
    public function up()
    {
        Schema::create('semesters', function (Blueprint $table) {
            $table->increments('semester_id');
            $table->unsignedInteger('year_level_id')->nullable();
            $table->integer('semester');
            $table->timestamps();

            $table->foreign('year_level_id')
                ->references('year_level_id')
                ->on('year_levels')
                ->onDelete('cascade');
            $table->index('year_level_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('semesters');
    }
}
