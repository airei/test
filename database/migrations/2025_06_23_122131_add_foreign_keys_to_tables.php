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
        // Foreign keys untuk tabel companies
        Schema::table('companies', function (Blueprint $table) {
            $table->char('created_by', 36)->nullable()->change();
            $table->char('updated_by', 36)->nullable()->change();
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // Foreign keys untuk tabel plants
        Schema::table('plants', function (Blueprint $table) {
            $table->char('company_id', 36)->change();
            $table->char('created_by', 36)->nullable()->change();
            $table->char('updated_by', 36)->nullable()->change();
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // Foreign keys untuk tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->char('company_id', 36)->nullable()->change();
            $table->char('plant_id', 36)->nullable()->change();
            $table->char('role_id', 36)->change();
            $table->char('created_by', 36)->nullable()->change();
            $table->char('updated_by', 36)->nullable()->change();
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->foreign('plant_id')->references('id')->on('plants')->onDelete('set null');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // Foreign keys untuk tabel permissions
        Schema::table('permissions', function (Blueprint $table) {
            $table->char('created_by', 36)->nullable()->change();
            $table->char('updated_by', 36)->nullable()->change();
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // Foreign keys untuk tabel sessions
        Schema::table('sessions', function (Blueprint $table) {
            $table->char('user_id', 36)->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign keys untuk tabel companies
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        // Drop foreign keys untuk tabel plants
        Schema::table('plants', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        // Drop foreign keys untuk tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['plant_id']);
            $table->dropForeign(['role_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        // Drop foreign keys untuk tabel permissions
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        // Drop foreign keys untuk tabel sessions
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
