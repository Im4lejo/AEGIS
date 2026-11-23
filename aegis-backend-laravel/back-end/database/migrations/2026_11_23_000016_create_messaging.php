<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversaciones', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['directa', 'grupal'])->default('directa');
            $table->string('titulo', 150)->nullable();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->string('contexto_clave', 255)->nullable();
            $table->enum('estado', ['activa', 'archivada', 'cerrada'])->default('activa');
            $table->timestamp('ultimo_mensaje_en')->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->index(['tipo', 'estado', 'ultimo_mensaje_en'], 'conversaciones_estado_idx');
            $table->unique('contexto_clave');
        });

        Schema::create('participantes_conversacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversaciones')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('rol', ['owner', 'admin', 'miembro'])->default('miembro');
            $table->enum('estado', ['activo', 'solicitado', 'silenciado', 'salido', 'baneado'])
                ->default('activo');
            $table->boolean('recibos_opt_in')->default(false);
            $table->boolean('notificar')->default(true);
            $table->timestamp('oculto_en')->nullable();
            $table->timestamp('ultimo_leido_en')->nullable();
            $table->timestamps();
            $table->unique(['conversacion_id', 'usuario_id'], 'participante_conversacion_unico');
            $table->index(['usuario_id', 'estado', 'ultimo_leido_en'], 'participantes_usuario_idx');
        });

        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversaciones')->cascadeOnDelete();
            $table->foreignId('autor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('respondido_a_id')->nullable()->constrained('mensajes')->nullOnDelete();
            $table->text('contenido')->nullable();
            $table->enum('estado', ['activo', 'editado', 'eliminado'])->default('activo');
            $table->timestamp('editado_en')->nullable();
            $table->timestamp('fecha_envio')->useCurrent();
            $table->index(['conversacion_id', 'estado', 'fecha_envio', 'id'], 'mensajes_cursor_idx');
        });

        Schema::create('lecturas_mensaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensaje_id')->constrained('mensajes')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamp('leido_en')->useCurrent();
            $table->unique(['mensaje_id', 'usuario_id'], 'lectura_mensaje_unica');
        });

        Schema::create('adjuntos_mensaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensaje_id')->constrained('mensajes')->cascadeOnDelete();
            $table->string('public_id')->nullable();
            $table->text('url');
            $table->string('nombre_original', 255)->nullable();
            $table->string('mime_type', 100);
            $table->unsignedInteger('size')->default(0);
            $table->timestamp('fecha')->useCurrent();
        });

        Schema::create('reportes_mensaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversaciones')->cascadeOnDelete();
            $table->foreignId('mensaje_id')->nullable()->constrained('mensajes')->nullOnDelete();
            $table->foreignId('reportante_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('motivo', 255);
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'revisado', 'resuelto'])->default('pendiente');
            $table->timestamp('fecha')->useCurrent();
            $table->index(['conversacion_id', 'estado', 'fecha'], 'reportes_conversacion_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_mensaje');
        Schema::dropIfExists('adjuntos_mensaje');
        Schema::dropIfExists('lecturas_mensaje');
        Schema::dropIfExists('mensajes');
        Schema::dropIfExists('participantes_conversacion');
        Schema::dropIfExists('conversaciones');
    }
};
