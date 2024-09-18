<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculaProgramTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('curricula_program')->insert([
            [
                'curricula_program_id' => 1,
                'curriculum_id' => 1,
                'program_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'curricula_program_id' => 2,
                'curriculum_id' => 1,
                'program_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'curricula_program_id' => 3,
                'curriculum_id' => 2,
                'program_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'curricula_program_id' => 4,
                'curriculum_id' => 2,
                'program_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
