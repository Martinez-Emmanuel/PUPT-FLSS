<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $primaryKey = 'semester_id';

    protected $fillable = [
        'year_level_id',
        'semester',
    ];

    public function yearLevel()
    {
        return $this->belongsTo(YearLevel::class, 'year_level_id', 'year_level_id');
    }

    public function courses()
    {
        return $this->hasManyThrough(
            Course::class,
            CourseAssignment::class,
            'semester_id', // Foreign key on CourseAssignment table...
            'course_id',   // Foreign key on Course table...
            'semester_id', // Local key on Semester table...
            'course_id'    // Local key on CourseAssignment table...
        );
    }
    public function activeSemesters()
    {
        return $this->hasMany(ActiveSemester::class, 'semester_id', 'semester_id');
    }

    public function courseAssignments()
    {
        return $this->hasMany(CourseAssignment::class, 'semester_id', 'semester_id');
    }
}
