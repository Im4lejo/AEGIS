<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('url_publica', 100)->nullable()->after('username');
            $table->string('ciudad_aprox', 100)->nullable()->after('ciudad');
            $table->boolean('perfil_privado')->default(false)->after('descripcion');
            $table->boolean('mostrar_seguidores')->default(true)->after('perfil_privado');
            $table->boolean('mostrar_presencia')->default(false)->after('mostrar_seguidores');
            $table->timestamp('ultima_actividad')->nullable()->after('mostrar_presencia');
            $table->foreignId('publicacion_fijada_id')->nullable()->after('ultima_actividad')
                ->constrained('publicaciones_foro')->nullOnDelete();
            $table->unique('url_publica');
        });

        Schema::create('enlaces_perfil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('tipo', 30);
            $table->string('url', 2048);
            $table->unsignedTinyInteger('orden')->default(0);
            $table->timestamps();
            $table->index(['usuario_id', 'orden']);
        });

        Schema::create('seguimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seguidor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('seguido_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('estado', ['pendiente', 'aceptado'])->default('aceptado');
            $table->timestamps();
            $table->unique(['seguidor_id', 'seguido_id']);
        });

        Schema::create('bloqueos_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bloqueador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('bloqueado_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('tipo', ['bloqueo', 'silencio'])->default('bloqueo');
            $table->timestamps();
            $table->unique(['bloqueador_id', 'bloqueado_id', 'tipo'], 'bloqueos_tipo_unicos');
            $table->index(['bloqueado_id', 'tipo']);
        });

        Schema::create('desactivaciones_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('estado', ['pendiente_retencion', 'desactivado'])->default('pendiente_retencion');
            $table->timestamp('programada_para');
            $table->timestamp('procesada_en')->nullable();
            $table->timestamps();
            $table->index(['estado', 'programada_para']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('desactivaciones_usuario');
        Schema::dropIfExists('bloqueos_usuario');
        Schema::dropIfExists('seguimientos');
        Schema::dropIfExists('enlaces_perfil');

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('publicacion_fijada_id');
            $table->dropUnique(['url_publica']);
            $table->dropColumn([
                'url_publica',
                'ciudad_aprox',
                'perfil_privado',
                'mostrar_seguidores',
                'mostrar_presencia',
                'ultima_actividad',
            ]);
        });
    }
};
