<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('comunidad_id')->nullable()->constrained('comunidades')->cascadeOnDelete();
            $table->enum('tipo_media', ['imagen', 'video']);
            $table->string('media_url');
            $table->string('media_public_id')->nullable();
            $table->string('mime_type', 100);
            $table->string('texto', 500)->nullable();
            $table->enum('audiencia', ['publica', 'seguidores', 'grupo_privado'])->default('seguidores');
            $table->enum('estado', ['activa', 'expirada', 'eliminada'])->default('activa');
            $table->timestamp('expira_en');
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->unsignedInteger('visualizaciones')->default(0);
            $table->index(['usuario_id', 'estado', 'expira_en'], 'historias_usuario_expira_idx');
            $table->index(['estado', 'audiencia', 'expira_en'], 'historias_feed_expira_idx');
        });

        Schema::create('visualizaciones_historia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('historia_id')->constrained('historias')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamp('fecha')->useCurrent();
            $table->unique(['historia_id', 'usuario_id']);
        });

        Schema::create('eventos_comunidad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comunidad_id')->constrained('comunidades')->cascadeOnDelete();
            $table->foreignId('creador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo', 200);
            $table->text('descripcion')->nullable();
            $table->string('lugar', 255)->nullable();
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->unsignedInteger('cupo')->nullable();
            $table->enum('estado', ['activo', 'cancelado', 'finalizado'])->default('activo');
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->index(['comunidad_id', 'estado', 'fecha_inicio'], 'eventos_comunidad_fecha_idx');
        });

        Schema::create('participaciones_evento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')->constrained('eventos_comunidad')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('estado', ['asistira', 'interesado', 'cancelado'])->default('interesado');
            $table->boolean('recordatorio')->default(true);
            $table->timestamp('recordar_en')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->unique(['evento_id', 'usuario_id']);
            $table->index(['evento_id', 'estado', 'recordar_en'], 'participaciones_evento_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participaciones_evento');
        Schema::dropIfExists('eventos_comunidad');
        Schema::dropIfExists('visualizaciones_historia');
        Schema::dropIfExists('historias');
    }
};
