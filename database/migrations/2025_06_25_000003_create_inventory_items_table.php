<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('company_id', 36)->nullable();
            $table->char('plant_id', 36)->nullable();
            $table->char('category_id', 36)->nullable();
            $table->char('unit_id', 36)->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->char('created_by', 36)->nullable();
            $table->char('updated_by', 36)->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->nullOnDelete();
            $table->foreign('plant_id')->references('id')->on('plants')->nullOnDelete();
            $table->foreign('category_id')->references('id')->on('inventory_categories')->nullOnDelete();
            $table->foreign('unit_id')->references('id')->on('inventory_units')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
}; 