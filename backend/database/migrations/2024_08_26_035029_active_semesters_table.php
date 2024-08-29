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
        Schema::create('active_semesters', function (Blueprint $table) {
            $table->increments('active_semester_id');
            $table->unsignedInteger('academic_year_id')->nullable();
            $table->unsignedInteger('semester_id')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('academic_year_id')
                  ->references('academic_year_id')
                  ->on('academic_years')
                  ->onDelete('set null');

            $table->foreign('semester_id')
                  ->references('semester_id')
                  ->on('semesters')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('active_semesters');
    }
};
