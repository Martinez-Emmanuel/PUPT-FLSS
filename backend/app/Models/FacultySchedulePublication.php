<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacultySchedulePublication extends Model
{
    use HasFactory;

    protected $table = 'faculty_schedule_publication';

    protected $primaryKey = 'faculty_schedule_publication_id';

    protected $fillable = [
        'faculty_id',
        'schedule_id',
        'is_published',
    ];


    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }
}
