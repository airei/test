<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_stock_movements', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('item_id', 36);
            $table->enum('type', ['in', 'out', 'adj', 'waste'])->comment('in: stock masuk, out: stock keluar, adj: penyesuaian, waste: pembuangan');
            $table->integer('quantity');
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->text('notes')->nullable();
            $table->string('reference_type')->nullable();
            $table->char('reference_id', 36)->nullable();
            $table->char('created_by', 36)->nullable();
            $table->char('updated_by', 36)->nullable();
            $table->timestamps();

            $table->foreign('item_id')->references('id')->on('inventory_items')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_stock_movements');
    }
}; 