<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class ApiKey extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'api_keys_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'system',
        'encrypted_key',
        'is_active',
        'key',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'encrypted_key',
    ];

    /**
     * Encrypt the API key before saving.
     *
     * @param  string  $value
     * @return void
     */
    public function setKeyAttribute($value)
    {
        $this->attributes['encrypted_key'] = Crypt::encryptString($value);
    }

    /**
     * Decrypt the API key when accessing it.
     *
     * @param  string  $value
     * @return string|null
     */
    public function getKeyAttribute($value)
    {
        try {
            return Crypt::decryptString($this->attributes['encrypted_key']);
        } catch (\Exception $e) {
            return null;
        }
    }
}
