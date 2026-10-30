<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuentro_id')->constrained('encuentros')->cascadeOnDelete();
            $table->foreignId('autor_id')->constrained('usuarios');
            $table->foreignId('receptor_id')->constrained('usuarios');
            $table->unsignedTinyInteger('puntuacion');
            $table->text('comentario')->nullable();
            $table->timestamp('fecha_calificacion')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calificaciones');
    }
};
