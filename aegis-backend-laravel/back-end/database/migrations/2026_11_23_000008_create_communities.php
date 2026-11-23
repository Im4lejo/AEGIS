<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comunidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('nombre', 150)->unique();
            $table->string('slug', 150)->unique();
            $table->text('descripcion')->nullable();
            $table->text('normas')->nullable();
            $table->string('categoria', 100)->nullable();
            $table->enum('visibilidad', ['publica', 'privada', 'invitacion'])->default('publica');
            $table->enum('estado', ['activa', 'cerrada', 'archivada'])->default('activa');
            $table->string('icono_url')->nullable();
            $table->string('icono_id')->nullable();
            $table->string('portada_url')->nullable();
            $table->string('portada_id')->nullable();
            $table->boolean('avisos_activos')->default(true);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->index(['estado', 'visibilidad', 'categoria'], 'comunidades_directorio_idx');
        });

        Schema::create('membresias_comunidad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comunidad_id')->constrained('comunidades')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('rol', ['owner', 'moderador', 'miembro'])->default('miembro');
            $table->enum('estado', ['activo', 'solicitado', 'invitado', 'baneado', 'expulsado', 'salido'])
                ->default('activo');
            $table->timestamp('fecha_union')->nullable();
            $table->timestamp('fecha_solicitud')->nullable();
            $table->timestamps();
            $table->unique(['comunidad_id', 'usuario_id'], 'membresia_comunidad_unica');
            $table->index(['comunidad_id', 'rol', 'estado'], 'membresia_gestion_idx');
            $table->index(['usuario_id', 'estado'], 'membresia_usuario_idx');
        });

        Schema::create('acciones_comunidad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comunidad_id')->constrained('comunidades')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('objetivo_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('accion', 100);
            $table->json('datos')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->index(['comunidad_id', 'fecha'], 'auditoria_comunidad_idx');
        });

        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->foreignId('comunidad_id')->nullable()->after('usuario_id')
                ->constrained('comunidades')->nullOnDelete();
            $table->index(['comunidad_id', 'estado', 'fecha_publicacion'], 'publicaciones_comunidad_idx');
        });
    }

    public function down(): void
    {
        Schema::table('publicaciones_foro', function (Blueprint $table) {
            $table->dropForeign(['comunidad_id']);
            $table->dropIndex('publicaciones_comunidad_idx');
            $table->dropColumn('comunidad_id');
        });

        Schema::dropIfExists('acciones_comunidad');
        Schema::dropIfExists('membresias_comunidad');
        Schema::dropIfExists('comunidades');
    }
};
