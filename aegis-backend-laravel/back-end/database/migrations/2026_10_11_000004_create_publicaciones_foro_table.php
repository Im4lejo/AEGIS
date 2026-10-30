<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publicaciones_foro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo', 200);
            $table->text('contenido');
            $table->timestamp('fecha_publicacion')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publicaciones_foro');
    }
};
