<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Schedule extends Model
{
    use HasFactory;

    protected $primaryKey = 'schedule_id';

    protected $fillable = [
        'section_course_id',
        'day',
        'start_time',
        'end_time',
        'faculty_id',
        'room_id',
        'is_published',
    ];

    public function sectionCourse()
    {
        return $this->belongsTo(SectionCourse::class, 'section_course_id', 'section_course_id');
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }

    public function schedulePublications()
    {
        return $this->hasMany(FacultySchedulePublication::class, 'schedule_id', 'schedule_id');
    }
}
