<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacultySchedulePublication extends Model
{
    use HasFactory;

    protected $table = 'faculty_schedule_publication';

    protected $primaryKey = 'faculty_schedule_publication_id';

    protected $fillable = [
        'faculty_id',
        'academic_year_id',
        'semester_id',
        'is_published'
    ];

    protected $casts = [
        'is_published' => 'boolean'
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeForActiveSemester($query)
    {
        return $query->whereHas('academicYear.activeSemesters', function($query) {
            $query->where('is_active', true);
        });
    }
}
