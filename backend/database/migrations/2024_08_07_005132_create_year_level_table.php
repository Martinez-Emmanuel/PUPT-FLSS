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
        Schema::create('year_levels', function (Blueprint $table) {
            $table->increments('year_level_id');
            $table->unsignedInteger('curricula_program_id')->nullable();
            $table->integer('year');
            $table->timestamps();

            // Foreign key to curricula_program table
            $table->foreign('curricula_program_id')
                ->references('curricula_program_id')
                ->on('curricula_program')
                ->onDelete('cascade')
                ->onUpdate('restrict');
            $table->index('curricula_program_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('year_levels');
    }
};
