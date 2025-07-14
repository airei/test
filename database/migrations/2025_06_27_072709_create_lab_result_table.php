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
        Schema::create('lab_result', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lab_detail_id');
            $table->text('result');
            $table->enum('result_status', ['normal', 'abnormal']);
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('lab_detail_id')->references('id')->on('lab_details')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('lab_detail_id');
            $table->index('result_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_result');
    }
};
