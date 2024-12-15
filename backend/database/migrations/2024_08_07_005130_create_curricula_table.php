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
        Schema::create('curricula', function (Blueprint $table) {
            $table->increments('curriculum_id');
            $table->string('curriculum_year', 4);
            $table->enum('status', ['Active', 'Inactive']);
            $table->index('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop dependent tables first to avoid foreign key constraint violations
        Schema::dropIfExists('curricula_program');
        Schema::dropIfExists('year_levels');
        
        // Now drop the curricula table
        Schema::dropIfExists('curricula');
    }
};
