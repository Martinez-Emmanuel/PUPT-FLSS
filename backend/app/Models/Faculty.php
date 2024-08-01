<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Faculty extends Model implements AuthenticatableContract
{
    use HasApiTokens, HasFactory, Authenticatable;

    protected $table = 'faculties';
    protected $primaryKey = 'faculty_id'; // Specify the primary key

    public $timestamps = false;

    protected $fillable = [
        'faculty_name', 
        'faculty_code', 
        'faculty_password', 
        'faculty_email', 
        'faculty_type'
    ];
}

