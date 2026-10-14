<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('username', 50)->nullable()->unique();
            $table->string('email', 150)->unique();
            $table->string('password');
            $table->string('telefono', 20)->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->string('foto_perfil')->default('default.png');
            $table->text('descripcion')->nullable();
            $table->decimal('reputacion', 3, 2)->default(5);
            $table->enum('rol', ['usuario', 'owner', 'admin'])->default('usuario');
            $table->enum('estado', ['activo', 'suspendido', 'baneado'])->default('activo');
            $table->timestamp('fecha_registro')->useCurrent();
        });

        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
        });

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

        Schema::create('imagenes_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('imagen');
            $table->boolean('principal')->default(false);
        });

        Schema::create('publicaciones_foro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo', 200);
            $table->text('contenido');
            $table->timestamp('fecha_publicacion')->useCurrent();
        });

        Schema::create('comentarios_foro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->text('comentario');
            $table->timestamp('fecha_comentario')->useCurrent();
        });

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

        Schema::create('codigos_qr', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuentro_id')->unique()
                ->constrained('encuentros')->cascadeOnDelete();
            $table->string('codigo');
            $table->enum('estado', ['activo', 'usado', 'expirado'])->default('activo');
            $table->timestamp('fecha_generacion')->useCurrent();
        });

        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuentro_id')->constrained('encuentros')->cascadeOnDelete();
            $table->foreignId('autor_id')->constrained('usuarios');
            $table->foreignId('receptor_id')->constrained('usuarios');
            $table->unsignedTinyInteger('puntuacion');
            $table->text('comentario')->nullable();
            $table->timestamp('fecha_calificacion')->useCurrent();
        });

        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_reporta_id')->constrained('usuarios');
            $table->foreignId('usuario_reportado_id')->constrained('usuarios');
            $table->string('motivo', 255);
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'revisado', 'resuelto'])->default('pendiente');
            $table->timestamp('fecha_reporte')->useCurrent();
        });

        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha_creacion')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('reportes');
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('codigos_qr');
        Schema::dropIfExists('encuentros');
        Schema::dropIfExists('puntos_fisicos');
        Schema::dropIfExists('comentarios_foro');
        Schema::dropIfExists('publicaciones_foro');
        Schema::dropIfExists('imagenes_producto');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('categorias');
        Schema::dropIfExists('usuarios');
    }
};
