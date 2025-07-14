<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabReference extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'lab_references';

    protected $fillable = [
        'lab_master_id',
        'reference_type',
        'reference',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'reference_type' => 'string',
    ];

    public function labMaster(): BelongsTo
    {
        return $this->belongsTo(LabMaster::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
} 