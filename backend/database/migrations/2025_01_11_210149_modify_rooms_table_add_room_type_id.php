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
        Schema::table('rooms', function (Blueprint $table) {
            $table->unsignedBigInteger('room_type_id')->nullable()->after('floor_level');
            $table->foreign('room_type_id')->references('room_type_id')->on('room_types');
        });

        $rooms = DB::table('rooms')->get();
        foreach ($rooms as $room) {
            $roomType = DB::table('room_types')
                ->where('type_name', $room->room_type)
                ->first();

            if ($roomType) {
                DB::table('rooms')
                    ->where('room_id', $room->room_id)
                    ->update(['room_type_id' => $roomType->room_type_id]);
            }
        }

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('room_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('room_type')->after('floor_level');
        });

        $rooms = DB::table('rooms')
            ->join('room_types', 'rooms.room_type_id', '=', 'room_types.room_type_id')
            ->get();

        foreach ($rooms as $room) {
            DB::table('rooms')
                ->where('room_id', $room->room_id)
                ->update(['room_type' => $room->type_name]);
        }

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropForeign(['room_type_id']);
            $table->dropColumn('room_type_id');
        });
    }
};
