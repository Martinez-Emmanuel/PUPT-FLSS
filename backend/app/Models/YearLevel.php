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
        'curricula_program_id',
    ];

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'year_level_id', 'year_level_id');
    }

    public function curriculaProgram()
    {
        return $this->belongsTo(CurriculaProgram::class, 'curricula_program_id', 'curricula_program_id');
    }
    
}
