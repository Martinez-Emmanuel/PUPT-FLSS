<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
