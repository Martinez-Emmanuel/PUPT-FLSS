<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    use HasFactory;

    // Use default primary key 'id' or specify if different
    // protected $primaryKey = 'curriculum_id';

    // Fillable attributes for mass assignment
    protected $fillable = [
        'curriculum_year',
        'status',
    ];

    // Define the relationship to the Program model
    public function programs()
    {
        return $this->hasMany(Program::class);
    }
}
