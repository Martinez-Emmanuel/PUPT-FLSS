<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculaTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('curricula')->insert([
            [
                'curriculum_id' => 1,
                'curriculum_year' => '2018',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'curriculum_id' => 2,
                'curriculum_year' => '2022',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
