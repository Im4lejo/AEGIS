<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_reporta_id')->constrained('usuarios');
            $table->foreignId('usuario_reportado_id')->constrained('usuarios');
            $table->string('motivo', 255);
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'revisado', 'resuelto'])->default('pendiente');
            $table->timestamp('fecha_reporte')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
