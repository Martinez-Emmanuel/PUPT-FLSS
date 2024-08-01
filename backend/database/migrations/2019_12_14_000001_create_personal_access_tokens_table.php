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
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('token');
            $table->text('abilities')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedBigInteger('tokenable_id');
            $table->string('tokenable_type');
            $table->timestamps();
        
            $table->index(['tokenable_id', 'tokenable_type']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
