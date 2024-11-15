<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'message',
        'is_read',
    ];

    /**
     * Relationship with Faculty.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}
