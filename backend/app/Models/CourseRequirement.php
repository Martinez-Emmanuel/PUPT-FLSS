<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'requirement_type',
        'required_course_id',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function requiredCourse()
    {
        return $this->belongsTo(Course::class, 'required_course_id', 'course_id');
    }
    public function requirements()
{
    return $this->hasMany(CourseRequirement::class, 'course_id', 'course_id');
}
}
