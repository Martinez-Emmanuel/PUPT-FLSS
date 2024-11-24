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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('suffix_name', 20)->nullable();

            $table->string('code', 50)->unique()->comment('Unique user identification code');
            $table->string('email')->unique();
            $table->string('password');

            $table->enum('role', ['faculty', 'admin', 'superadmin']);
            $table->enum('status', ['Active', 'Inactive']);
            $table->timestamps();

            $table->index(['email', 'status']);
            $table->index(['role', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
