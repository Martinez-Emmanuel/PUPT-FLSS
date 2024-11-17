<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePreferencesSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('preferences_settings', function (Blueprint $table) {
            $table->increments('preferences_settings_id');
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->tinyInteger('has_request')->default(0)->comment('1 for request made, 0 for no request');
            $table->tinyInteger('is_enabled')->default(0)->comment('1 for enabled, 0 for disabled');
            $table->date('global_deadline')->nullable();
            $table->date('individual_deadline')->nullable();
            $table->timestamps();

            $table->foreign('faculty_id')
                ->references('id')->on('faculty')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->unique(['faculty_id'], 'unique_faculty_setting');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('preferences_settings');
    }
}
