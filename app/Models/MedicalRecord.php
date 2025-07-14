<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicalRecord extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'medical_records';

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
        'outpatient_visit_id',
        'examiner_id',
        'shift_id',
        'guarantor',
        'chief_complaint',
        'systolic_bp',
        'diastolic_bp',
        'pulse_rate',
        'resp_rate',
        'temperature',
        'oxygen_saturation',
        'weight',
        'height',
        'phys_exam',
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
        'temperature' => 'decimal:2',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    /**
     * Get the outpatient queue that owns the medical record.
     */
    public function outpatientQueue(): BelongsTo
    {
        return $this->belongsTo(OutpatientQueue::class, 'outpatient_visit_id');
    }

    /**
     * Get the examiner (user) for the medical record.
     */
    public function examiner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }

    /**
     * Get the shift for the medical record.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    /**
     * Get the patient-guarantor relationship for the medical record.
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(PatientToGuarantor::class, 'guarantor');
    }

    /**
     * Get the user who created the medical record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the medical record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the diagnosis details for this medical record.
     */
    public function diagnosisDetails(): HasMany
    {
        return $this->hasMany(DiagnosisDetail::class, 'medical_record_id');
    }

    /**
     * Get the prescriptions for this medical record.
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'medical_record_id');
    }

    /**
     * Get the lab requests for this medical record.
     */
    public function labRequests(): HasMany
    {
        return $this->hasMany(LabRequest::class, 'outpatient_queue_id', 'outpatient_visit_id');
    }
}
