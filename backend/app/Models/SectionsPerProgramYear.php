<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionsPerProgramYear extends Model
{
    use HasFactory;
    protected $table = 'sections_per_program_year';
    protected $primaryKey = 'sections_per_program_year_id';

    protected $fillable = [
        'academic_year_id',
        'program_id',
        'year_level',
        'section_name',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function sectionCourses()
    {
        return $this->hasMany(SectionCourse::class, 'sections_per_program_year_id', 'sections_per_program_year_id');
    }
    public function programYearLevelCurricula()
    {
        return $this->belongsTo(ProgramYearLevelCurricula::class, 'program_year_level_curricula_id');
    }
}
