<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurriculaProgram extends Model
{
    use HasFactory;

    protected $table = 'curricula_program'; // Specify the correct table name
    protected $primaryKey = 'curricula_program_id';

    protected $fillable = [
        'curriculum_id',
        'program_id',
    ];

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id', 'curriculum_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class, 'curricula_program_id', 'curricula_program_id');
    }
}