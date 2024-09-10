<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class Faculty extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'faculty';

    protected $fillable = [
        'user_id',
        'faculty_email',
        'faculty_type',
        'faculty_unit',
        'faculty_password',
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function setFacultyPasswordAttribute($value)
    {
        $this->attributes['faculty_password'] = Hash::make($value);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'faculty_id', 'id');
    }
}
