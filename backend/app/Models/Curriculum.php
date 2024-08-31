<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    // use HasFactory;

    // // protected $primaryKey = 'curriculum_id';

    // // Fillable attributes for mass assignment
    // protected $fillable = [
    //     'curriculum_year',
    //     'status',
    // ];

    // // Define the relationship to the Program model
    // public function programs()
    // {
    //     return $this->belongsToMany(Program::class, 'curricula_program', 'curriculum_id', 'program_id');
    // }
    use HasFactory;

    protected $primaryKey = 'curriculum_id';

    protected $fillable = [
        'curriculum_year',
        'status',
        'program_id',
    ];

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'curricula_program', 'curriculum_id', 'program_id');
    }
    public function curriculaPrograms()
    {
        return $this->hasMany(CurriculaProgram::class, 'curriculum_id', 'curriculum_id');
    }
    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class, 'curricula_program_id', 'curricula_program_id');
    }
    
}

