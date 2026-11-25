<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos_operacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('capacidad', 80);
            $table->string('alcance', 80)->default('global');
            $table->foreignId('otorgado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('otorgado_en')->useCurrent();
            $table->timestamp('revocado_en')->nullable();
            $table->unique(['usuario_id', 'capacidad', 'alcance'], 'permisos_operacion_unico');
            $table->index(['usuario_id', 'revocado_en'], 'permisos_operacion_actor_idx');
        });

        Schema::create('configuracion_global', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 100)->unique();
            $table->text('valor');
            $table->string('tipo', 20)->default('string');
            $table->unsignedInteger('version')->default(1);
            $table->foreignId('actualizado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('actualizado_en')->useCurrent();
        });

        Schema::create('avisos_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->text('contenido');
            $table->string('nivel', 20)->default('info');
            $table->string('estado', 20)->default('borrador');
            $table->timestamp('vigente_desde')->nullable();
            $table->timestamp('vigente_hasta')->nullable();
            $table->foreignId('creado_por')->constrained('usuarios')->cascadeOnDelete();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->index(['estado', 'vigente_desde', 'vigente_hasta'], 'avisos_estado_vigencia_idx');
        });

        Schema::table('categorias', function (Blueprint $table) {
            if (! Schema::hasColumn('categorias', 'estado')) {
                $table->string('estado', 20)->default('activa');
            }
            if (! Schema::hasColumn('categorias', 'orden')) {
                $table->unsignedSmallInteger('orden')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn(['estado', 'orden']);
        });
        Schema::dropIfExists('avisos_sistema');
        Schema::dropIfExists('configuracion_global');
        Schema::dropIfExists('permisos_operacion');
    }
};
