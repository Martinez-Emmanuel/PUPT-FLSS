<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Semester;
use App\Models\YearLevel;

class SemestersTableSeeder extends Seeder
{
    public function run()
    {
        $yearLevel1BSIT2018 = YearLevel::where('curricula_program_id', 1)->first();
        $yearLevel1BSA2018 = YearLevel::where('curricula_program_id', 2)->first();
        $yearLevel1BSIT2022 = YearLevel::where('curricula_program_id', 3)->first();
        $yearLevel1BSA2022 = YearLevel::where('curricula_program_id', 4)->first();

        Semester::create(['year_level_id' => $yearLevel1BSIT2018->year_level_id, 'semester' => 1]);
        Semester::create(['year_level_id' => $yearLevel1BSA2018->year_level_id, 'semester' => 1]);
        Semester::create(['year_level_id' => $yearLevel1BSIT2022->year_level_id, 'semester' => 1]);
        Semester::create(['year_level_id' => $yearLevel1BSA2022->year_level_id, 'semester' => 1]);
    }
}
