<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->increments('section_id');
            $table->string('section_name', 50);
            $table->unsignedInteger('year_level_id')->nullable();
            $table->unsignedInteger('academic_year_id')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('year_level_id')
                  ->references('year_level_id')
                  ->on('year_levels')
                  ->onDelete('set null');

            $table->foreign('academic_year_id')
                  ->references('academic_year_id')
                  ->on('academic_years')  
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
