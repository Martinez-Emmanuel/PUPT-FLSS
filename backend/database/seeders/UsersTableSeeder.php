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
                'first_name' => 'Emmanuel',
                'middle_name' => 'Q.',
                'last_name' => 'Martinez',
                'suffix_name' => null,
                'code' => 'FA0001TG2024',
                'email' => 'emmanuellmartinez013@gmail.com',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'first_name' => 'Marissa',
                'middle_name' => 'B.',
                'last_name' => 'Ferrer',
                'suffix_name' => null,
                'code' => 'ADM001TG2024',
                'email' => 'marissa.ferrer@example.com',
                'password' => Hash::make('adminpass'),
                'role' => 'admin',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'first_name' => 'Emmanuel',
                'middle_name' => 'Q.',
                'last_name' => 'Martinez',
                'suffix_name' => null,
                'code' => 'SDM001TG2024',
                'email' => 'emmanuel.martinez@example.com',
                'password' => Hash::make('superadminpass'),
                'role' => 'superadmin',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'first_name' => 'Adrian',
                'middle_name' => 'B.',
                'last_name' => 'Naoe',
                'suffix_name' => null,
                'code' => 'FA0002TG2024',
                'email' => 'adrian.naoe@example.com',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'first_name' => 'Kyla Rica',
                'middle_name' => 'C.',
                'last_name' => 'Malaluan',
                'suffix_name' => null,
                'code' => 'FA0003TG2024',
                'email' => 'kyla.malaluan@example.com',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'first_name' => 'Via Clariz',
                'middle_name' => 'A.',
                'last_name' => 'Rasquero',
                'suffix_name' => null,
                'code' => 'FA0004TG2024',
                'email' => 'via.rasquero@example.com',
                'password' => Hash::make('facultypass'),
                'role' => 'faculty',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
