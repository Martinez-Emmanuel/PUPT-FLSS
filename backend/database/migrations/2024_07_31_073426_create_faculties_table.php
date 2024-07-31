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
        Schema::create('faculties', function (Blueprint $table) {
            $table->id('faculty_id');
            $table->string('faculty_name');
            $table->string('faculty_code', 15);
            $table->string('faculty_password');
            $table->string('faculty_email');
            $table->string('faculty_type', 50);
            $table->timestamps();
        });

        DB::statement('
            CREATE TRIGGER before_faculty_insert 
            BEFORE INSERT ON faculties 
            FOR EACH ROW 
            BEGIN 
                IF NEW.faculty_code NOT REGEXP \'^FA[0-9]{4}TG2024$\' THEN 
                    SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Invalid faculty_code format\'; 
                END IF; 
            END
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculties');
    }
};
