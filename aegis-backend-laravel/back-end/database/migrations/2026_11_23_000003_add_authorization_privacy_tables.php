<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->enum('visibilidad', ['publica', 'privada', 'grupo_privado'])
                ->default('publica')
                ->after('estado_publicacion');
            $table->index(['estado_publicacion', 'visibilidad'], 'productos_visibilidad_idx');
        });

        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->enum('visibilidad', ['publica', 'privada', 'grupo_privado'])
                ->default('publica')
                ->after('contenido');
            $table->index(['visibilidad', 'fecha_publicacion'], 'publicaciones_visibilidad_idx');
        });

        Schema::create('permisos_delegados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('recurso_tipo', 100);
            $table->unsignedBigInteger('recurso_id');
            $table->string('capacidad', 100);
            $table->foreignId('otorgado_por')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamp('fecha_otorgamiento')->useCurrent();
            $table->unique(
                ['usuario_id', 'recurso_tipo', 'recurso_id', 'capacidad'],
                'permisos_delegados_unicos',
            );
            $table->index(['recurso_tipo', 'recurso_id', 'capacidad'], 'permisos_recurso_idx');
        });

        Schema::create('auditoria_accesos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('accion', 100);
            $table->string('recurso_tipo', 100);
            $table->unsignedBigInteger('recurso_id')->nullable();
            $table->json('datos')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->index(['actor_id', 'fecha'], 'auditoria_actor_fecha_idx');
            $table->index(['recurso_tipo', 'recurso_id'], 'auditoria_recurso_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria_accesos');
        Schema::dropIfExists('permisos_delegados');

        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->dropIndex('publicaciones_visibilidad_idx');
            $table->dropColumn('visibilidad');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->dropIndex('productos_visibilidad_idx');
            $table->dropColumn('visibilidad');
        });
    }
};
