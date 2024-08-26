<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    // use HasFactory;

    // protected $primaryKey = 'program_id';

    // protected $fillable = [
    //     'curriculum_id',
    //     'program_code',
    //     'program_title',
    //     'program_info',
    //     'status',
    //     'number_of_years',
    // ];

    // public function curriculum()
    // {
    //     return $this->belongsTo(Curriculum::class, 'curriculum_id', 'curriculum_id');
    // }

    // public function yearLevels()
    // {
    //     return $this->hasMany(YearLevel::class, 'program_id', 'program_id');
    // }

    // public function courseAssignments()
    // {
    //     return $this->hasMany(CourseAssignment::class, 'program_id', 'program_id');
    // }
    // public function curricula()
    // {
    //     return $this->belongsToMany(Curriculum::class, 'curricula_program', 'program_id', 'curriculum_id');
    // }
    use HasFactory;

    protected $primaryKey = 'program_id';

    protected $fillable = [
        'program_code',
        'program_title',
        'program_info',
        'status',
        'number_of_years',
    ];

    public function curricula()
    {
        return $this->belongsToMany(Curriculum::class, 'curricula_program', 'program_id', 'curriculum_id');
    }

    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class, 'program_id', 'program_id');
    }

    public function courseAssignments()
    {
        return $this->hasMany(CourseAssignment::class, 'program_id', 'program_id');
    }

}
