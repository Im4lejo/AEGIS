<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->enum('tipo', ['discusion', 'pregunta', 'tutorial', 'encuesta', 'anuncio'])
                ->default('discusion')
                ->after('contenido');
            $table->enum('interaccion_estado', ['abierto', 'cerrado'])
                ->default('abierto')
                ->after('tipo');
            $table->foreignId('respuesta_aceptada_id')
                ->nullable()
                ->after('interaccion_estado')
                ->constrained('comentarios_foro')
                ->nullOnDelete();
            $table->timestamp('cerrado_en')->nullable()->after('respuesta_aceptada_id');
            $table->timestamp('ultima_actividad')->nullable()->after('cerrado_en');
            $table->unsignedInteger('actividad_score')->default(0)->after('ultima_actividad');
            $table->index(['comunidad_id', 'tipo', 'estado', 'ultima_actividad'], 'hilos_comunidad_actividad_idx');
            $table->index(['tipo', 'estado', 'actividad_score'], 'hilos_tipo_popularidad_idx');
        });

        Schema::create('encuestas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->string('pregunta', 500);
            $table->boolean('permite_multiple')->default(false);
            $table->timestamp('finaliza_en')->nullable();
            $table->timestamps();
            $table->unique('publicacion_id');
        });

        Schema::create('opciones_encuesta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuesta_id')->constrained('encuestas')->cascadeOnDelete();
            $table->string('texto', 255);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
            $table->unique(['encuesta_id', 'texto']);
        });

        Schema::create('votos_encuesta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuesta_id')->constrained('encuestas')->cascadeOnDelete();
            $table->foreignId('opcion_id')->constrained('opciones_encuesta')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamp('fecha_voto')->useCurrent();
            $table->unique(['encuesta_id', 'usuario_id', 'opcion_id'], 'voto_usuario_opcion_unico');
        });

        Schema::create('suscripciones_hilo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('estado', ['activa', 'silenciada'])->default('activa');
            $table->timestamps();
            $table->unique(['publicacion_id', 'usuario_id']);
        });

        Schema::create('historial_publicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->foreignId('editor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo', 200);
            $table->text('contenido');
            $table->json('datos')->nullable();
            $table->timestamp('editado_en')->useCurrent();
            $table->index(['publicacion_id', 'editado_en']);
        });

        Schema::table('comentarios_foro', function (Blueprint $table) {
            $table->unsignedInteger('votos_utiles')->default(0)->after('estado');
            $table->boolean('es_solucion')->default(false)->after('votos_utiles');
        });

        Schema::create('votos_respuesta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comentario_id')->constrained('comentarios_foro')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->tinyInteger('valor');
            $table->timestamps();
            $table->unique(['comentario_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votos_respuesta');
        Schema::table('comentarios_foro', function (Blueprint $table) {
            $table->dropColumn(['votos_utiles', 'es_solucion']);
        });
        Schema::dropIfExists('historial_publicacion');
        Schema::dropIfExists('suscripciones_hilo');
        Schema::dropIfExists('votos_encuesta');
        Schema::dropIfExists('opciones_encuesta');
        Schema::dropIfExists('encuestas');

        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->dropForeign(['respuesta_aceptada_id']);
            $table->dropIndex('hilos_comunidad_actividad_idx');
            $table->dropIndex('hilos_tipo_popularidad_idx');
            $table->dropColumn([
                'tipo',
                'interaccion_estado',
                'respuesta_aceptada_id',
                'cerrado_en',
                'ultima_actividad',
                'actividad_score',
            ]);
        });
    }
};
