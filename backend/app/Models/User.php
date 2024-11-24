<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'code',
        'email',
        'password',
        'role',
        'status',
    ];

    /**
     * Accessor to get the full name.
     */
    public function getNameAttribute()
    {
        $fullName = $this->first_name;
        if ($this->middle_name) {
            $fullName .= ' ' . $this->middle_name;
        }
        $fullName .= ' ' . $this->last_name;
        if ($this->suffix_name) {
            $fullName .= ' ' . $this->suffix_name;
        }
        return $fullName;
    }

    /**
     * Hash the password before saving to the database.
     */
    public function setPasswordAttribute($value)
    {
        if (!Hash::needsRehash($value)) {
            $value = Hash::make($value);
        }
        $this->attributes['password'] = $value;
    }

    public function faculty()
    {
        return $this->hasOne(Faculty::class, 'user_id');
    }

}
