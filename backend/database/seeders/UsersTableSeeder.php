<?php

namespace Database\Seeders;

use Database\Seeders\Csv\CsvToArray;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        $csvPath = database_path('seeders/csv/users.csv');

        try {
            $csvData = CsvToArray::convert($csvPath);
        } catch (\Exception $e) {
            $this->command->error($e->getMessage());
            return;
        }

        $dataToInsert = [];

        foreach ($csvData as $record) {
            $dataToInsert[] = [
                'id' => $record['id'],
                'first_name' => $record['first_name'],
                'middle_name' => $record['middle_name'] === 'NULL' ? null : $record['middle_name'],
                'last_name' => $record['last_name'],
                'suffix_name' => $record['suffix_name'] === 'NULL' ? null : $record['suffix_name'],
                'code' => $record['code'],
                'email' => $record['email'],
                'password' => $record['password'],
                'role' => $record['role'],
                'status' => $record['status'],
                'created_at' => $record['created_at'],
                'updated_at' => $record['updated_at'],
            ];
        }

        try {
            DB::table('users')->insert($dataToInsert);
            $this->command->info('Users table seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding users table: ' . $e->getMessage());
        }
    }
}
