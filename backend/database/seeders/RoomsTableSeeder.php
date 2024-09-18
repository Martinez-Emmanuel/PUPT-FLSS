<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('rooms')->insert([
            [
                'room_id' => 1,
                'room_code' => 'A201',
                'location' => 'Building A',
                'floor_level' => '2nd',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 2,
                'room_code' => 'A301',
                'location' => 'Building A',
                'floor_level' => '3rd',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 3,
                'room_code' => 'A401',
                'location' => 'Building A',
                'floor_level' => '4th',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 4,
                'room_code' => 'DOST Lab',
                'location' => 'Building A',
                'floor_level' => '2nd',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 5,
                'room_code' => 'Aboitiz Lab',
                'location' => 'Building A',
                'floor_level' => '3rd',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
