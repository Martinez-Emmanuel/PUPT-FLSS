<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActiveSemester extends Model
{
    use HasFactory;

    protected $primaryKey = 'active_semester_id';

    protected $fillable = [
        'academic_year_id',
        'semester_id',
        'is_active',
        'start_date',
        'end_date',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }

    public function preferences()
    {
        return $this->hasMany(Preference::class, 'active_semester_id', 'active_semester_id');
    }
}
