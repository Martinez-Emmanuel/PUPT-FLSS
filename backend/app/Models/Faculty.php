<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Faculty extends Authenticatable
{
    use HasApiTokens, HasFactory;
    protected $primaryKey = 'faculty_id';
    protected $fillable = ['faculty_code', 'faculty_name', 'faculty_email', 'faculty_password'];
    // Additional model properties and methods...
}
