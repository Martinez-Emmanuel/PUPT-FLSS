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
        Schema::create('programs', function (Blueprint $table) {
            $table->increments('program_id');  
            $table->string('program_code', 10);  
            $table->string('program_title', 100);  
            $table->string('program_info', 255); 
            $table->integer('number_of_years'); 
            $table->enum('status', ['Active', 'Inactive']);
            $table->index('status');
            $table->timestamps();


            $table->unique('program_code');  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
