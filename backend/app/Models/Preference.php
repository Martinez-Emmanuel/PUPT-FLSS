<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preference extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'academic_year_id',
        'semester_id',
        'course_id',
        'preferred_day',
        'preferred_time',
    ];

    // Relationship with Faculty
    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    // Relationship with Course
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    // Relationship with Academic Year
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    // Relationship with Active Semester
    public function activeSemester()
    {
        return $this->belongsTo(ActiveSemester::class, 'semester_id');
    }
}
