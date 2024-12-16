<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('academic_year_curricula', function (Blueprint $table) {
            $table->id('academic_year_curricula_id');
            $table->unsignedInteger('academic_year_id');
            $table->unsignedInteger('curriculum_id');
            $table->timestamps();

            $table->foreign('academic_year_id')
                ->references('academic_year_id')->on('academic_years')
                ->onDelete('cascade');

            $table->foreign('curriculum_id')
                ->references('curriculum_id')->on('curricula')
                ->onDelete('cascade');
            $table->index('academic_year_id');
            $table->index('curriculum_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_year_curricula');
    }
};
