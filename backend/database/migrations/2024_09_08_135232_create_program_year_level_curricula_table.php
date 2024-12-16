<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_year_level_curricula', function (Blueprint $table) {
            $table->id('program_year_level_curricula_id');
            $table->unsignedInteger('academic_year_id');
            $table->unsignedInteger('program_id');
            $table->integer('year_level');
            $table->unsignedInteger('curriculum_id');
            $table->timestamps();

            $table->foreign('academic_year_id')
                ->references('academic_year_id')->on('academic_years')
                ->onDelete('cascade');

            $table->foreign('program_id')
                ->references('program_id')->on('programs')
                ->onDelete('cascade');

            $table->foreign('curriculum_id')
                ->references('curriculum_id')->on('curricula')
                ->onDelete('cascade');
            $table->index('academic_year_id');
            $table->index('program_id');
            $table->index('curriculum_id');
            $table->index('year_level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_year_level_curricula');
    }
};
