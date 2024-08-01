<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;
    protected $table = 'faculties';
    protected $primaryKey = 'faculty_id'; // Specify the primary key

    public $timestamps = false;
    protected $fillable = ['faculty_name', 'faculty_code', 'faculty_password', 'faculty_email', 'faculty_type'];
}
