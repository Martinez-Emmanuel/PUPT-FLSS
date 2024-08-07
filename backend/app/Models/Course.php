<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $primaryKey = 'course_id';

    protected $fillable = [
        'subject_code',
        'subject_title',
        'lec_hours',
        'lab_hours',
        'total_units',
    ];

    public function preferences()
    {
        return $this->hasMany(Preference::class);
    }
}
