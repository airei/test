<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutpatientQueue extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'outpatient_queue';

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
        'outpatient_visit_number',
        'status',
        'shift_id',
        'guarantor_id',
        'examiner_id',
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
     * Get the shift for the outpatient queue.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    /**
     * Get the guarantor for the outpatient queue.
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(Guarantor::class);
    }

    /**
     * Get the examiner (user) for the outpatient queue.
     */
    public function examiner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }

    /**
     * Get the patient record that owns the outpatient queue.
     */
    public function patientRecord(): BelongsTo
    {
        return $this->belongsTo(PatientRecord::class, 'patient_record_id');
    }

    /**
     * Get the user who created the outpatient queue.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the outpatient queue.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the medical records for this outpatient queue.
     */
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class, 'outpatient_visit_id');
    }

    /**
     * Get the lab requests for this outpatient queue.
     */
    public function labRequests(): HasMany
    {
        return $this->hasMany(LabRequest::class, 'outpatient_queue_id');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate outpatient visit number automatically
        static::creating(function ($outpatientQueue) {
            if (empty($outpatientQueue->outpatient_visit_number)) {
                $outpatientQueue->outpatient_visit_number = 'KJ-' . date('Ymd') . '-' . str_pad(static::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
