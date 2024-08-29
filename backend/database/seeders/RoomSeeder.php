<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('rooms')->insert([
            [
                'room_code' => 'A201',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'A202',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'A203',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'A204',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'A205',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'DOSTLAB',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 60,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'ABOITIZLAB',
                'location' => 'Building A',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 60,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'B302',
                'location' => 'Building B',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'B303',
                'location' => 'Building B',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'B304',
                'location' => 'Building B',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'B305',
                'location' => 'Building B',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'B306',
                'location' => 'Building B',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 30,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'C101',
                'location' => 'Building C',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 100,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'ENG101',
                'location' => 'Engineering Building',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'ENG102',
                'location' => 'Engineering Building',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 60,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'ENG103',
                'location' => 'Engineering Building',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'ENG104',
                'location' => 'Engineering Building',
                'floor_level' => '1st',
                'room_type' => 'Lab',
                'capacity' => 60,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'room_code' => 'ENG105',
                'location' => 'Engineering Building',
                'floor_level' => '1st',
                'room_type' => 'Lecture',
                'capacity' => 50,
                'status' => 'available',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
