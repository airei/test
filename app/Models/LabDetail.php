<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LabDetail extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lab_details';

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
        'lab_request_id',
        'lab_master_id',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // No specific casts needed
    ];

    /**
     * Get the lab request that owns the lab detail.
     */
    public function labRequest(): BelongsTo
    {
        return $this->belongsTo(LabRequest::class, 'lab_request_id');
    }

    /**
     * Get the lab master that owns the lab detail.
     */
    public function labMaster(): BelongsTo
    {
        return $this->belongsTo(LabMaster::class, 'lab_master_id');
    }

    /**
     * Get the user who created the lab detail.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the lab detail.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the lab result for this lab detail.
     */
    public function labResult(): HasOne
    {
        return $this->hasOne(LabResult::class, 'lab_detail_id');
    }
}
