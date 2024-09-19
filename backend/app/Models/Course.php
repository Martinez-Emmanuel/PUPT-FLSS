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
        'tuition_hours',
    ];

    public function assignments()
    {
        return $this->hasMany(CourseAssignment::class, 'course_id', 'course_id');
    }

    public function requirements()
    {
        return $this->hasMany(CourseRequirement::class, 'course_id', 'course_id');
    }
    public function preferences()
    {
        return $this->hasMany(Preference::class, 'course_id');
    }
}
