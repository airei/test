<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientToGuarantor extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'patient_to_guarantors';

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
        'patient_records_id',
        'guarantors_id',
        'guarantor_number',
        'created_by',
        'updated_by',
    ];

    /**
     * Get the patient record that owns this guarantor relation.
     */
    public function patientRecord(): BelongsTo
    {
        return $this->belongsTo(PatientRecord::class, 'patient_records_id');
    }

    /**
     * Get the guarantor that owns this relation.
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(Guarantor::class, 'guarantors_id');
    }

    /**
     * Get the user who created this record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
} 