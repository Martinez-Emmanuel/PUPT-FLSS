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
        'hris_user_id',
        'faculty_type',
        'faculty_units',
        'faculty_password',
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
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
