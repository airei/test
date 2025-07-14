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
        Schema::create('diagnosas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name', 300);
            $table->string('description', 300)->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by');
            $table->uuid('updated_by');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
            
            // Add indexes for search performance
            $table->index(['code'], 'diagnosas_code_index');
            $table->index(['name'], 'diagnosas_name_index');
            $table->index(['description'], 'diagnosas_description_index');
            $table->index(['is_active'], 'diagnosas_is_active_index');
            
            // Composite index for common search patterns
            $table->index(['is_active', 'code'], 'diagnosas_active_code_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnosas');
    }
};
