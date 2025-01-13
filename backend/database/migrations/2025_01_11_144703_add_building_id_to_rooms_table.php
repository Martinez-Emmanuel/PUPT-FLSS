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
        if (Schema::hasColumn('rooms', 'location')) {
            if (!Schema::hasColumn('rooms', 'building_id')) {
                Schema::table('rooms', function (Blueprint $table) {
                    $table->unsignedBigInteger('building_id')->after('room_id')->nullable();
                });
            }

            $defaultBuilding = DB::table('buildings')->first();
            if ($defaultBuilding) {
                DB::table('rooms')->whereNull('building_id')->update([
                    'building_id' => $defaultBuilding->building_id,
                ]);
            }

            Schema::table('rooms', function (Blueprint $table) {
                $table->unsignedBigInteger('building_id')->nullable(false)->change();

                try {
                    $table->foreign('building_id')
                        ->references('building_id')
                        ->on('buildings')
                        ->onDelete('cascade');
                } catch (\Exception $e) {
                }

                $table->dropColumn('location');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            if (!Schema::hasColumn('rooms', 'location')) {
                $table->string('location');
            }

            try {
                $table->dropForeign(['building_id']);
            } catch (\Exception $e) {
            }

            if (Schema::hasColumn('rooms', 'building_id')) {
                $table->dropColumn('building_id');
            }
        });
    }
};
