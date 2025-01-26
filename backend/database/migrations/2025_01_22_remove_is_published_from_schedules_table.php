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
        Schema::table('schedules', function (Blueprint $table) {
            // First drop the index
            $table->dropIndex('schedules_is_published_index');
            // Then drop the column
            $table->dropColumn('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // Recreate the column
            $table->boolean('is_published')->default(0);
            // Recreate the index
            $table->index('is_published', 'schedules_is_published_index');
        });
    }
}; 