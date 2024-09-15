<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramYearLevelCurricula extends Model
{
    use HasFactory;
    protected $table = 'program_year_level_curricula';
    protected $primaryKey = 'program_year_level_curricula_id';

    protected $fillable = [
        'academic_year_id',
        'program_id',
        'year_level',
        'curriculum_id',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id', 'curriculum_id');
    }

    public function sectionsPerProgramYear()
    {
        return $this->hasMany(SectionsPerProgramYear::class, 'program_id', 'program_id')
            ->where('year_level', $this->year_level)
            ->where('academic_year_id', $this->academic_year_id);
    }
}
