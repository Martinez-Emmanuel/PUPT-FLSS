<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseAssignment extends Model
{
    use HasFactory;

    protected $primaryKey = 'course_assignment_id';

    protected $fillable = [
        'program_id',
        'semester_id',
        'course_id',
    ];

    // Relationship with Course
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    // Relationship with Semester
    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }

    // Relationship with Program
    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }
}
