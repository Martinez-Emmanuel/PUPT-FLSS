<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $primaryKey = 'academic_year_id';

    protected $fillable = [
        'year_start',
        'year_end',
        'is_active',
    ];

    public function activeSemesters()
    {
        return $this->hasMany(ActiveSemester::class, 'academic_year_id', 'academic_year_id');
    }

    public function academicYearCurricula()
    {
        return $this->hasMany(AcademicYearCurricula::class, 'academic_year_id', 'academic_year_id');
    }

    public function programYearLevelCurricula()
    {
        return $this->hasMany(ProgramYearLevelCurricula::class, 'academic_year_id', 'academic_year_id');
    }

    public function sectionsPerProgramYear()
    {
        return $this->hasMany(SectionsPerProgramYear::class, 'academic_year_id', 'academic_year_id');
    }
    public function preferences()
    {
        return $this->hasMany(Preference::class, 'academic_year_id');
    }
}
