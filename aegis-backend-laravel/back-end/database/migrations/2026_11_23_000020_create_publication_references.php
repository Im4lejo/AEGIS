<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referencias_publicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->enum('tipo', ['producto', 'publicacion', 'comunidad', 'punto']);
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->foreignId('publicacion_referida_id')->nullable()
                ->constrained('publicaciones_foro')->nullOnDelete();
            $table->foreignId('comunidad_id')->nullable()->constrained('comunidades')->nullOnDelete();
            $table->foreignId('punto_id')->nullable()->constrained('puntos_fisicos')->nullOnDelete();
            $table->unsignedTinyInteger('orden')->default(0);
            $table->timestamps();
            $table->unique(['publicacion_id', 'tipo', 'producto_id', 'publicacion_referida_id', 'comunidad_id', 'punto_id'], 'referencia_publicacion_unica');
            $table->index(['tipo', 'producto_id'], 'referencia_tipo_producto_idx');
            $table->index(['tipo', 'comunidad_id'], 'referencia_tipo_comunidad_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referencias_publicacion');
    }
};
