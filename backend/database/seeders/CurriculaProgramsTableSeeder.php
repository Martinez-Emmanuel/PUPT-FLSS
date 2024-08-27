<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CurriculaProgramsTableSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        DB::table('curricula_program')->insert([
            [
                'curriculum_id' => 1,
                'program_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'curriculum_id' => 1,
                'program_id' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'curriculum_id' => 2,
                'program_id' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'curriculum_id' => 2,
                'program_id' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
