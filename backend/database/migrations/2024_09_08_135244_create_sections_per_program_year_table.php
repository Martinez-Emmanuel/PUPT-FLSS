<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections_per_program_year', function (Blueprint $table) {
            $table->bigIncrements('sections_per_program_year_id');
            $table->unsignedInteger('academic_year_id');
            $table->unsignedInteger('program_id');
            $table->integer('year_level');
            $table->string('section_name', 50);
            $table->timestamps();

            $table->foreign('academic_year_id')
                ->references('academic_year_id')->on('academic_years')
                ->onDelete('cascade');

            $table->foreign('program_id')
                ->references('program_id')->on('programs')
                ->onDelete('cascade');
            $table->index('academic_year_id');
            $table->index('program_id');
            $table->index('year_level');
            $table->index('section_name');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('sections_per_program_year');
    }
};
