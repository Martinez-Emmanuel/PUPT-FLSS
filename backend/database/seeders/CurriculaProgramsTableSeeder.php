<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CurriculaProgram;
use App\Models\Curriculum;
use App\Models\Program;

class CurriculaProgramsTableSeeder extends Seeder
{
    public function run()
    {
        $curriculum2018 = Curriculum::where('curriculum_year', 2018)->first();
        $curriculum2022 = Curriculum::where('curriculum_year', 2022)->first();

        $bsitProgram = Program::where('program_code', 'BSIT')->first();
        $bsaProgram = Program::where('program_code', 'BSA')->first();

        CurriculaProgram::create([
            'curriculum_id' => $curriculum2018->curriculum_id,
            'program_id' => $bsitProgram->program_id
        ]);

        CurriculaProgram::create([
            'curriculum_id' => $curriculum2018->curriculum_id,
            'program_id' => $bsaProgram->program_id
        ]);

        CurriculaProgram::create([
            'curriculum_id' => $curriculum2022->curriculum_id,
            'program_id' => $bsitProgram->program_id
        ]);

        CurriculaProgram::create([
            'curriculum_id' => $curriculum2022->curriculum_id,
            'program_id' => $bsaProgram->program_id
        ]);
    }
}
