<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comentarios_foro', function (Blueprint $table) {
            $table->foreignId('comentario_padre_id')->nullable()->after('usuario_id')
                ->constrained('comentarios_foro')->cascadeOnDelete();
            $table->enum('estado', ['activo', 'editado', 'eliminado'])
                ->default('activo')
                ->after('comentario');
            $table->timestamp('editado_en')->nullable()->after('fecha_comentario');
            $table->index(['publicacion_id', 'comentario_padre_id', 'fecha_comentario'], 'comentarios_hilo_idx');
        });

        Schema::create('reposts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->text('comentario')->nullable();
            $table->timestamps();
            $table->unique(['usuario_id', 'publicacion_id']);
            $table->index(['publicacion_id', 'created_at']);
        });

        Schema::create('colecciones_guardado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('nombre', 100);
            $table->boolean('privada')->default(true);
            $table->timestamps();
            $table->unique(['usuario_id', 'nombre']);
        });

        Schema::create('guardados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('coleccion_id')->nullable()->constrained('colecciones_guardado')->nullOnDelete();
            $table->string('recurso_tipo', 100);
            $table->unsignedBigInteger('recurso_id');
            $table->timestamps();
            $table->unique(['usuario_id', 'recurso_tipo', 'recurso_id'], 'guardado_actor_recurso_unico');
            $table->index(['usuario_id', 'coleccion_id', 'created_at'], 'guardados_lista_idx');
        });

        Schema::table('reportes', function (Blueprint $table) {
            $table->string('recurso_tipo', 100)->nullable()->after('descripcion');
            $table->unsignedBigInteger('recurso_id')->nullable()->after('recurso_tipo');
            $table->timestamp('resuelto_en')->nullable()->after('estado');
            $table->index(['recurso_tipo', 'recurso_id', 'estado'], 'reportes_contexto_idx');
        });

        if (! Schema::hasColumn('seguimientos', 'relacion_key')) {
            Schema::table('seguimientos', function (Blueprint $table) {
                $table->string('relacion_key', 255)->nullable()->after('seguido_id');
                $table->index(['seguidor_id', 'estado'], 'seguimientos_actor_estado_idx');
                $table->index(['seguido_id', 'estado'], 'seguimientos_destino_estado_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->dropIndex('reportes_contexto_idx');
            $table->dropColumn(['recurso_tipo', 'recurso_id', 'resuelto_en']);
        });

        Schema::dropIfExists('guardados');
        Schema::dropIfExists('colecciones_guardado');
        Schema::dropIfExists('reposts');

        Schema::table('comentarios_foro', function (Blueprint $table) {
            $table->dropForeign(['comentario_padre_id']);
            $table->dropIndex('comentarios_hilo_idx');
            $table->dropColumn(['comentario_padre_id', 'estado', 'editado_en']);
        });

        if (Schema::hasColumn('seguimientos', 'relacion_key')) {
            Schema::table('seguimientos', function (Blueprint $table) {
                $table->dropIndex('seguimientos_actor_estado_idx');
                $table->dropIndex('seguimientos_destino_estado_idx');
                $table->dropColumn('relacion_key');
            });
        }
    }
};
