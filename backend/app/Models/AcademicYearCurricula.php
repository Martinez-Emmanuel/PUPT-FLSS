<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYearCurricula extends Model
{
    use HasFactory;
    protected $table = 'academic_year_curricula';

    protected $primaryKey = 'academic_year_curricula_id';

    protected $fillable = [
        'academic_year_id',
        'curriculum_id',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id', 'curriculum_id');
    }
}
