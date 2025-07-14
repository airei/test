<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LabQueue extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lab_queue';

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
        'patient_record_id',
        'lab_visit_number',
        'status',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get the patient record that owns the lab queue.
     */
    public function patientRecord(): BelongsTo
    {
        return $this->belongsTo(PatientRecord::class, 'patient_record_id');
    }

    /**
     * Get the user who created the lab queue.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the lab queue.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the lab requests for this lab queue.
     */
    public function labRequests(): HasMany
    {
        return $this->hasMany(LabRequest::class, 'lab_queue_id');
    }

    /**
     * Get the lab request for this lab queue (single).
     */
    public function labRequest(): HasOne
    {
        return $this->hasOne(LabRequest::class, 'lab_queue_id');
    }

    /**
     * Get the lab exam detail for this lab queue.
     */
    public function labExamDetail(): HasOne
    {
        return $this->hasOne(LabExamDetail::class, 'lab_queue_id');
    }
}
