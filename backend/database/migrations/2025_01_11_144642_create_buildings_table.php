<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('buildings')) {
            Schema::create('buildings', function (Blueprint $table) {
                $table->id('building_id');
                $table->string('building_name');
                $table->integer('floor_levels');
                $table->timestamps();
            });

            // Insert a default building
            DB::table('buildings')->insert([
                'building_name' => 'Main Building',
                'floor_levels' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buildings');
    }
};
