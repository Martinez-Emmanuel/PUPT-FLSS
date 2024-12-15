<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFacultyNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('faculty_notifications', function (Blueprint $table) {
            $table->bigIncrements('faculty_notifications_id');
            $table->unsignedBigInteger('faculty_id');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            // Foreign Key Constraint
            $table->foreign('faculty_id')
                ->references('id')->on('faculty')
                ->onDelete('cascade');
            $table->index('faculty_id');
            $table->index('is_read');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('faculty_notifications');
    }
}
