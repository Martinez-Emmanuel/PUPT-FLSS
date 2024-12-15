<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->increments('academic_year_id');
            $table->integer('year_start');
            $table->integer('year_end');
            $table->boolean('is_active')->default(false);
            $table->index('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
