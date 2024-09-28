<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            [
                'id' => 1,
                'name' => 'Emmanuel Martinez',
                'code' => 'FA0001TG2024',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Marissa B Ferrer',
                'code' => 'ADM001TG2024',
                'password' => Hash::make('adminpass'),
                'role' => 'admin',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Emmanuel Martinez',
                'code' => 'SDM001TG2024',
                'password' => Hash::make('superadminpass'),
                'role' => 'superadmin',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Adrian Naoe',
                'code' => 'FA0002TG2024',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Kyla Malaluan',
                'code' => 'FA0003TG2024',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Via Rasquero',
                'code' => 'FA0004TG2024',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
