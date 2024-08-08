<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preference extends Model
{
    use HasFactory;

    protected $primaryKey = 'preference_id';

    protected $fillable = [
        'faculty_id',
        'course_id',
        'preferred_day',
        'preferred_time',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}

