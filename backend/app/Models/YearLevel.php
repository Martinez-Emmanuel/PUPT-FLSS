<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YearLevel extends Model
{
    use HasFactory;

    protected $primaryKey = 'year_level_id';

    protected $fillable = [
        'year',
        'program_id',  
    ];

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'year_level_id', 'year_level_id');
    }
}
