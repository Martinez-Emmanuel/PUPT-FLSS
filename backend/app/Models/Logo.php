<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logo extends Model
{
    use HasFactory;

    public const TYPE_UNIVERSITY = 'university';
    public const TYPE_GOVERNMENT = 'government';

    protected $fillable = [
        'type',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public static function getTypes(): array
    {
        return [
            self::TYPE_UNIVERSITY,
            self::TYPE_GOVERNMENT,
        ];
    }
}
