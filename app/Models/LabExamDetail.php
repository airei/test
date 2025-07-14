<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabExamDetail extends Model
{
    use HasUuids;

    protected $fillable = [
        'lab_queue_id',
        'examiner_id',
        'guarantor_id',
        'shift_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the lab queue that owns the exam detail.
     */
    public function labQueue(): BelongsTo
    {
        return $this->belongsTo(LabQueue::class, 'lab_queue_id');
    }

    /**
     * Get the examiner (user) who performed the exam.
     */
    public function examiner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }

    /**
     * Get the guarantor for this exam.
     */
    public function guarantor(): BelongsTo
    {
        return $this->belongsTo(Guarantor::class, 'guarantor_id');
    }

    /**
     * Get the shift for this exam.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'shift_id');
    }

    /**
     * Get the user who created this exam detail.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this exam detail.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
