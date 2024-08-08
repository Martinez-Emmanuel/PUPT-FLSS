<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class Faculty extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'faculty_id';

    protected $fillable = [
        'faculty_name',
        'faculty_code',
        'faculty_password',
        'faculty_email',
        'faculty_type',
        'faculty_units', 
    ];

    /**
     * Hash the password before saving to the database.
     */
    public function setFacultyPasswordAttribute($value)
    {
        $this->attributes['faculty_password'] = Hash::make($value);
    }
}
