<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plants', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('company_id', 36);
            $table->char('code', 3)->comment('Kode plant 3 digit unik per company (001, 002, 003)');
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->char('created_by', 36)->nullable();
            $table->char('updated_by', 36)->nullable();
            $table->timestamps();
            
            // Unique constraint untuk code per company
            $table->unique(['company_id', 'code'], 'plants_company_code_unique');
            
            // Foreign key constraints akan ditambahkan setelah tabel users dibuat
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plants');
    }
};
