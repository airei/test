<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PatientRecord extends Model
{
    use HasUuids;

    protected $table = 'patient_records';

    protected $fillable = [
        'medical_record_number',
        'company_id',
        'plant_id',
        'employee_status_id',
        'department_id',
        'name',
        'nik',
        'nip',
        'gender',
        'birth_date',
        'blood_type',
        'blood_rhesus',
        'phone_number',
        'address',
        'illness_history',
        'allergy',
        'prolanis_status',
        'prb_status',
        'emergency_contact_name',
        'emergency_contact_relations',
        'emergency_contact_number',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'prolanis_status' => 'boolean',
        'prb_status' => 'boolean',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }

    public function employeeStatus(): BelongsTo
    {
        return $this->belongsTo(EmployeeStatus::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function outpatientQueues(): HasMany
    {
        return $this->hasMany(OutpatientQueue::class, 'patient_record_id');
    }

    public function labQueues(): HasMany
    {
        return $this->hasMany(LabQueue::class, 'patient_record_id');
    }

    public function guarantor(): HasOne
    {
        return $this->hasOne(PatientToGuarantor::class, 'patient_records_id');
    }

    public function guarantors(): HasMany
    {
        return $this->hasMany(PatientToGuarantor::class, 'patient_records_id');
    }

    // Accessors
    public function getGenderTextAttribute(): string
    {
        return $this->gender === 'L' ? 'Laki-laki' : 'Perempuan';
    }

    public function getBloodTypeTextAttribute(): string
    {
        if (!$this->blood_type) return '-';
        return $this->blood_type . ($this->blood_rhesus ?? '');
    }

    public function getAgeAttribute(): int
    {
        return $this->birth_date ? $this->birth_date->age : 0;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query;
    }

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeByPlant($query, $plantId)
    {
        return $query->where('plant_id', $plantId);
    }
}
