<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    use HasFactory;

    protected $primaryKey = 'curriculum_id';

    protected $fillable = [
        'curriculum_year',
        'status',
    ];

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'curricula_program', 'curriculum_id', 'program_id');
    }

    public function curriculaPrograms()
    {
        return $this->hasMany(CurriculaProgram::class, 'curriculum_id', 'curriculum_id');
    }

    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class, 'curricula_program_id', 'curricula_program_id');
    }

    public function academicYearCurricula()
    {
        return $this->hasMany(AcademicYearCurricula::class, 'curriculum_id', 'curriculum_id');
    }

    public function programYearLevelCurricula()
    {
        return $this->hasMany(ProgramYearLevelCurricula::class, 'curriculum_id', 'curriculum_id');
    }
}
