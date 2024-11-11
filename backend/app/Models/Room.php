<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $primaryKey = 'room_id';

    protected $fillable = [
        'room_id',
        'room_code',
        'location',
        'floor_level',
        'room_type',
        'capacity',
        'status',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'room_id', 'room_id');
    }
}
