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
        Schema::create('room_types', function (Blueprint $table) {
            $table->bigIncrements('room_type_id');
            $table->string('type_name')->unique();
            $table->timestamps();
        });

        DB::table('room_types')->insert([
            ['type_name' => 'Lecture', 'created_at' => now(), 'updated_at' => now()],
            ['type_name' => 'Laboratory', 'created_at' => now(), 'updated_at' => now()],
            ['type_name' => 'Office', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
