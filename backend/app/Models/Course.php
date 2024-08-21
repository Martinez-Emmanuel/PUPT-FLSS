<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $primaryKey = 'course_id';

    protected $fillable = [
        'course_code',
        'course_title',
        'lec_hours',
        'lab_hours',
        'units',
        'semester_id',
        'tuition_hours',
    ];

    // Relationship with CourseRequirement
    public function requirements()
    {
        return $this->hasMany(CourseRequirement::class, 'course_id', 'course_id');
    }

    // Relationship with Semester
    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }
}
