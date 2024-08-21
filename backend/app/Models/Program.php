<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $primaryKey = 'program_id';

    protected $fillable = [
        'curriculum_id',
        'program_code',
        'program_title',
        'program_info',
        'status',
        'number_of_years',
    ];

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id', 'curriculum_id');
    }

    public function yearLevels()
    {
        return $this->hasMany(YearLevel::class, 'program_id', 'program_id');
    }
}
