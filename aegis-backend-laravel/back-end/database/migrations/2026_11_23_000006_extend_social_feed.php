<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->enum('estado', ['publicado', 'borrador', 'programado', 'archivado', 'eliminado'])
                ->default('publicado')
                ->after('contenido');
            $table->timestamp('programada_para')->nullable()->after('fecha_publicacion');
            $table->timestamp('editada_en')->nullable()->after('programada_para');
            $table->boolean('fijada')->default(false)->after('editada_en');
            $table->unsignedInteger('rank_base')->default(0)->after('fijada');
            $table->json('etiquetas')->nullable()->after('rank_base');
            $table->json('menciones')->nullable()->after('etiquetas');
            $table->string('enlace_preview_url', 2048)->nullable()->after('menciones');
            $table->string('enlace_preview_titulo', 255)->nullable()->after('enlace_preview_url');
            $table->index(['usuario_id', 'estado', 'fecha_publicacion'], 'publicaciones_feed_autor_idx');
            $table->index(['estado', 'visibilidad', 'fecha_publicacion', 'id'], 'publicaciones_feed_cursor_idx');
        });

        Schema::create('reacciones_publicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('tipo', ['me_gusta', 'util', 'apoyo'])->default('me_gusta');
            $table->timestamp('fecha_reaccion')->useCurrent();
            $table->unique(['publicacion_id', 'usuario_id', 'tipo'], 'reacciones_usuario_unicas');
            $table->index(['publicacion_id', 'tipo']);
        });

        Schema::create('menciones_publicacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['publicacion_id', 'usuario_id']);
        });

        Schema::create('etiquetas_publicacion', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('nombre', 100);
            $table->timestamps();
        });

        Schema::create('etiqueta_publicacion', function (Blueprint $table) {
            $table->foreignId('publicacion_id')->constrained('publicaciones_foro')->cascadeOnDelete();
            $table->foreignId('etiqueta_id')->constrained('etiquetas_publicacion')->cascadeOnDelete();
            $table->primary(['publicacion_id', 'etiqueta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etiqueta_publicacion');
        Schema::dropIfExists('etiquetas_publicacion');
        Schema::dropIfExists('menciones_publicacion');
        Schema::dropIfExists('reacciones_publicacion');

        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->dropIndex('publicaciones_feed_autor_idx');
            $table->dropIndex('publicaciones_feed_cursor_idx');
            $table->dropColumn([
                'estado',
                'programada_para',
                'editada_en',
                'fijada',
                'rank_base',
                'etiquetas',
                'menciones',
                'enlace_preview_url',
                'enlace_preview_titulo',
            ]);
        });
    }
};
