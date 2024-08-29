<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Curriculum;

class CurriculaTableSeeder extends Seeder
{
    public function run()
    {
        Curriculum::create(['curriculum_year' => 2018, 'status' => 'active']);
        Curriculum::create(['curriculum_year' => 2022, 'status' => 'active']);
    }
}
