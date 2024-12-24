<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreferencesSetting extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'preferences_settings';
    protected $primaryKey = 'preferences_settings_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'faculty_id',
        'is_enabled',
        'global_deadline',
        'individual_deadline',
        'global_start_date',
        'individual_start_date',
        'has_request',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'is_enabled' => 'boolean',
        'global_deadline' => 'datetime:Y-m-d H:i:s',
        'individual_deadline' => 'datetime:Y-m-d H:i:s',
        'global_start_date' => 'datetime:Y-m-d H:i:s',
        'individual_start_date' => 'datetime:Y-m-d H:i:s',
        'has_request' => 'boolean',
    ];

    /**
     * Get the faculty that owns the preference setting.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    /**
     * Scope a query to only include global settings.
     */
    public function scopeGlobal($query)
    {
        return $query->whereNull('faculty_id');
    }

    /**
     * Scope a query to only include individual faculty settings.
     */
    public function scopeForFaculty($query, $facultyId)
    {
        return $query->where('faculty_id', $facultyId);
    }
}
