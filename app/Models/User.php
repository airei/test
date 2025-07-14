<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'company_id',
        'plant_id',
        'role_id',
        'name',
        'email',
        'password',
        'is_active',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the role that owns the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the company that owns the user.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the plant that owns the user.
     */
    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    /**
     * Get the user who created this user.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this user.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Cek apakah user punya permission tertentu (granular hybrid).
     * Super admin selalu true.
     */
    public function hasPermission($permission)
    {
        if ($this->role && $this->role->name === 'super_admin') {
            return true;
        }
        if (!$this->role) return false;
        return $this->role->permissions->pluck('name')->contains($permission);
    }

    /**
     * Cek apakah user punya akses ke module tertentu.
     * Super admin selalu true.
     */
    public function hasModuleAccess($module)
    {
        if ($this->role && $this->role->name === 'super_admin') {
            return true;
        }
        if (!$this->role) return false;
        return $this->role->permissions->pluck('module')->contains($module);
    }

    /**
     * Cek apakah user adalah super admin.
     */
    public function isSuperAdmin()
    {
        return $this->role && $this->role->name === 'super_admin';
    }

    /**
     * Cek apakah user punya permission untuk action tertentu.
     */
    public function can($action, $module = null)
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($module) {
            return $this->hasPermission("{$module}.{$action}");
        }

        return $this->hasPermission($action);
    }

    /**
     * Get all permissions for the user.
     */
    public function getAllPermissions()
    {
        if (!$this->role) return collect();
        return $this->role->permissions;
    }

    /**
     * Get all modules the user has access to.
     */
    public function getAccessibleModules()
    {
        if (!$this->role) return collect();
        return $this->role->permissions->pluck('module')->unique()->values();
    }
}
