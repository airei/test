<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStockMovement extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_stock_movements';

    // Stock movement types
    const TYPE_IN = 'in';           // Stock masuk
    const TYPE_OUT = 'out';         // Stock keluar
    const TYPE_ADJUSTMENT = 'adj';  // Penyesuaian stock
    const TYPE_WASTE = 'waste';     // Pembuangan stock

    protected $fillable = [
        'item_id',
        'type',
        'quantity',
        'stock_before',
        'stock_after',
        'notes',
        'reference_type',
        'reference_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the display name for the movement type
     */
    public function getTypeDisplayNameAttribute(): string
    {
        return match($this->type) {
            self::TYPE_IN => 'Stock Masuk',
            self::TYPE_OUT => 'Stock Keluar',
            self::TYPE_ADJUSTMENT => 'Penyesuaian',
            self::TYPE_WASTE => 'Pembuangan',
            default => 'Tidak Diketahui'
        };
    }
} 