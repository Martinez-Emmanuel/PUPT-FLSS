<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Faculty extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'faculty';

    protected $fillable = [
        'user_id',
        'faculty_type_id',
    ];

    protected $with = ['facultyType'];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facultyType()
    {
        return $this->belongsTo(FacultyType::class, 'faculty_type_id');
    }

    public function getFacultyUnitsAttribute(): float
    {
        return $this->facultyType ? $this->facultyType->total_units : 0;
    }

    public function setFacultyPasswordAttribute($value)
    {
        $this->attributes['faculty_password'] = Hash::make($value);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'faculty_id', 'id');
    }

    public function preferences()
    {
        return $this->hasMany(Preference::class, 'faculty_id');
    }

    public function preferenceSetting()
    {
        return $this->hasOne(PreferencesSetting::class, 'faculty_id', 'id');
    }

    public function schedulePublications()
    {
        return $this->hasMany(FacultySchedulePublication::class, 'faculty_id', 'id');
    }
}
