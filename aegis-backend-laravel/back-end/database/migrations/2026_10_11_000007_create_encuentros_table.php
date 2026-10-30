<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encuentros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comprador_id')->constrained('usuarios');
            $table->foreignId('vendedor_id')->constrained('usuarios');
            $table->foreignId('producto_id')->constrained('productos');
            $table->foreignId('punto_fisico_id')->constrained('puntos_fisicos');
            $table->date('fecha_encuentro');
            $table->time('hora_encuentro');
            $table->enum('estado', ['pendiente', 'confirmado', 'cancelado', 'finalizado'])
                ->default('pendiente');
            $table->timestamp('fecha_creacion')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encuentros');
    }
};
