<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('puntos_fisicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('direccion', 255);
            $table->string('ciudad', 100);
            $table->string('telefono', 30)->nullable();
            $table->string('imagen')->nullable();
            $table->decimal('reputacion', 3, 2)->default(5);
            $table->enum('estado', ['activo', 'pendiente', 'suspendido'])->default('pendiente');
            $table->timestamp('fecha_registro')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('puntos_fisicos');
    }
};
