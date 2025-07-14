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
        Schema::create('patient_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('medical_record_number')->unique();
            $table->uuid('company_id')->nullable();
            $table->uuid('plant_id')->nullable();
            $table->uuid('employee_status_id')->nullable();
            $table->uuid('department_id')->nullable();
            $table->string('name');
            $table->string('nik', 16)->nullable();
            $table->string('nip', 20)->nullable();
            $table->enum('gender', ['L', 'P']);
            $table->date('birth_date');
            $table->enum('blood_type', ['A', 'B', 'AB', 'O'])->nullable();
            $table->enum('blood_rhesus', ['+', '-'])->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->text('address')->nullable();
            $table->text('illness_history')->nullable();
            $table->text('allergy')->nullable();
            $table->boolean('prolanis_status')->default(false);
            $table->boolean('prb_status')->default(false);
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_relations', 50)->nullable();
            $table->string('emergency_contact_number', 20)->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->foreign('plant_id')->references('id')->on('plants')->onDelete('set null');
            $table->foreign('employee_status_id')->references('id')->on('employee_statuses')->onDelete('set null');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['company_id', 'plant_id']);
            $table->index('medical_record_number');
            $table->index('nik');
            $table->index('nip');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_records');
    }
};
