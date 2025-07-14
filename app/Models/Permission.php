<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'created_by',
        'updated_by',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
                    ->withPivot(['created_by', 'updated_by'])
                    ->withTimestamps();
    }
} 