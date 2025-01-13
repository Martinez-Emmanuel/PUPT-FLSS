<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacultyType extends Model
{
    protected $table = 'faculty_type';
    protected $primaryKey = 'faculty_type_id';

    protected $fillable = [
        'faculty_type',
        'regular_units',
        'additional_units',
    ];

    public function faculty(): HasMany
    {
        return $this->hasMany(Faculty::class, 'faculty_type_id');
    }

    public function getTotalUnitsAttribute(): float
    {
        return $this->regular_units + $this->additional_units;
    }
}
