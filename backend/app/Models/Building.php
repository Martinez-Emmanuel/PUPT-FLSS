<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Building extends Model
{
    use HasFactory;

    protected $primaryKey = 'building_id';

    protected $fillable = [
        'building_name',
        'floor_levels',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class, 'building_id');
    }
}
