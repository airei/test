<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabRequest extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lab_request';

    /**
     * Indicates if the model's ID is auto-incrementing.
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
     * @var array<int, string>
     */
    protected $fillable = [
        'lab_queue_id',
        'outpatient_queue_id',
        'reference',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reference' => 'string',
    ];

    /**
     * Get the lab queue that owns the lab request.
     */
    public function labQueue(): BelongsTo
    {
        return $this->belongsTo(LabQueue::class, 'lab_queue_id');
    }

    /**
     * Get the outpatient queue that owns the lab request.
     */
    public function outpatientQueue(): BelongsTo
    {
        return $this->belongsTo(OutpatientQueue::class, 'outpatient_queue_id');
    }

    /**
     * Get the user who created the lab request.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the lab request.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the lab details for this lab request.
     */
    public function labDetails(): HasMany
    {
        return $this->hasMany(LabDetail::class, 'lab_request_id');
    }
}
