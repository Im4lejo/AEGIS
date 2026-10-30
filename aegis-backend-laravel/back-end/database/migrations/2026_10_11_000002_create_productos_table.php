<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('categoria_id')->constrained('categorias');
            $table->string('titulo', 150);
            $table->text('descripcion');

            $table->decimal('precio', 12, 2);
            $table->enum('estado_producto', ['nuevo', 'usado', 'reacondicionado'])->default('usado');
            $table->string('ciudad', 100)->nullable();
            $table->enum('estado_publicacion', ['activo', 'vendido', 'oculto'])->default('activo');
            $table->timestamp('fecha_publicacion')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};