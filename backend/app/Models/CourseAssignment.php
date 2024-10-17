<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseAssignment extends Model
{
    use HasFactory;

    protected $primaryKey = 'course_assignment_id';

    protected $fillable = [
        'curricula_program_id',
        'semester_id',
        'course_id',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }

    public function curriculaProgram()
    {
        return $this->belongsTo(CurriculaProgram::class, 'curricula_program_id', 'curricula_program_id');
    }

    public function sectionCourses()
    {
        return $this->hasMany(SectionCourse::class, 'course_assignment_id', 'course_assignment_id');
    }

    public function preferences()
    {
        return $this->hasMany(Preference::class, 'course_assignment_id', 'course_assignment_id');
    }
}
