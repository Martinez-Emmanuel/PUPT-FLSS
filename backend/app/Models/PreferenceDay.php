<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreferenceDay extends Model
{
    use HasFactory;

    protected $table = 'preference_days';
    protected $primaryKey = 'preference_day_id';

    protected $fillable = [
        'preference_id',
        'preferred_day',
        'preferred_start_time',
        'preferred_end_time',
    ];

    public function preference()
    {
        return $this->belongsTo(Preference::class, 'preference_id');
    }
}
