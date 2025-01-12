<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_type', function (Blueprint $table) {
            $table->id('faculty_type_id');
            $table->string('faculty_type');
            $table->integer('regular_units');
            $table->integer('additional_units');
            $table->timestamps();
        });

        // Add default faculty types
        $defaultTypes = [
            ['faculty_type' => 'Full-Time', 'regular_units' => 24, 'additional_units' => 6],
            ['faculty_type' => 'Part-Time', 'regular_units' => 12, 'additional_units' => 3],
            ['faculty_type' => 'Temporary', 'regular_units' => 18, 'additional_units' => 3],
            ['faculty_type' => 'Designee', 'regular_units' => 9, 'additional_units' => 3],
        ];

        foreach ($defaultTypes as $type) {
            DB::table('faculty_type')->insert([
                'faculty_type' => $type['faculty_type'],
                'regular_units' => $type['regular_units'],
                'additional_units' => $type['additional_units'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_type');
    }
};
