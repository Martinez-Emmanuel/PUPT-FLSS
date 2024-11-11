<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $primaryKey = 'program_id';

    protected $fillable = [
        'program_code',
        'program_title',
        'program_info',
        'status',
        'number_of_years',
    ];

    public function curricula()
    {
        return $this->belongsToMany(Curriculum::class, 'curricula_program', 'program_id', 'curriculum_id');
    }

    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class, 'curricula_program_id', 'program_id');
    }

    public function courseAssignments()
    {
        return $this->hasMany(CourseAssignment::class, 'program_id', 'program_id');
    }

    public function curriculaPrograms()
    {
        return $this->hasMany(CurriculaProgram::class, 'program_id', 'program_id');
    }

    public function programYearLevelCurricula()
    {
        return $this->hasMany(ProgramYearLevelCurricula::class, 'program_id', 'program_id');
    }

    public function sectionsPerProgramYear()
    {
        return $this->hasMany(SectionsPerProgramYear::class, 'program_id', 'program_id');
    }
}
