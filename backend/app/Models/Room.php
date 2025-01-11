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
        'building_id',
        'floor_level',
        'room_type_id',
        'capacity',
        'status',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'room_id', 'room_id');
    }

    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }
}
