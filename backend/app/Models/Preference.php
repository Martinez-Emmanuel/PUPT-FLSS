<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preference extends Model
{
    use HasFactory;

    protected $table = 'preferences';

    protected $primaryKey = 'preferences_id';

    protected $fillable = [
        'faculty_id',
        'active_semester_id',
        'course_assignment_id',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    public function activeSemester()
    {
        return $this->belongsTo(ActiveSemester::class, 'active_semester_id');
    }

    public function courseAssignment()
    {
        return $this->belongsTo(CourseAssignment::class, 'course_assignment_id');
    }

    public function course()
    {
        return $this->hasOneThrough(
            Course::class,
            CourseAssignment::class,
            'course_assignment_id',
            'course_id',
            'course_assignment_id',
            'course_id'
        );
    }

    public function preferenceDays() {
        return $this->hasMany(PreferenceDay::class, 'preference_id');
    }
}
