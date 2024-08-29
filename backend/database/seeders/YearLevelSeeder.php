<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\YearLevel;
use App\Models\CurriculaProgram;

class YearLevelSeeder extends Seeder
{
    public function run()
    {
        $bsitCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 1)->first();
        $bsaCurriculaProgram2018 = CurriculaProgram::where('curriculum_id', 1)->where('program_id', 2)->first();
        $bsitCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 1)->first();
        $bsaCurriculaProgram2022 = CurriculaProgram::where('curriculum_id', 2)->where('program_id', 2)->first();

        YearLevel::create(['year' => 1, 'curricula_program_id' => $bsitCurriculaProgram2018->curricula_program_id]);
        YearLevel::create(['year' => 1, 'curricula_program_id' => $bsaCurriculaProgram2018->curricula_program_id]);
        YearLevel::create(['year' => 1, 'curricula_program_id' => $bsitCurriculaProgram2022->curricula_program_id]);
        YearLevel::create(['year' => 1, 'curricula_program_id' => $bsaCurriculaProgram2022->curricula_program_id]);
    }
}
