<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('reportes', 'prioridad')) {
            Schema::table('reportes', function (Blueprint $table) {
                $table->string('prioridad', 20)->default('normal')->after('estado');
                $table->foreignId('asignado_id')->nullable()->after('prioridad')->constrained('usuarios')->nullOnDelete();
                $table->json('evidencia')->nullable()->after('asignado_id');
                $table->timestamp('asignado_en')->nullable();
                $table->timestamp('revision_en')->nullable();
                if (! Schema::hasColumn('reportes', 'resuelto_en')) {
                    $table->timestamp('resuelto_en')->nullable();
                }
                $table->text('razon_resolucion')->nullable();
                $table->string('sancion_tipo', 30)->nullable();
                $table->timestamp('sancion_hasta')->nullable();
                $table->string('fingerprint', 64)->nullable();
                $table->index(['estado', 'prioridad', 'fecha_reporte'], 'reportes_cola_idx');
                $table->index(['recurso_tipo', 'recurso_id', 'estado'], 'reportes_contexto_estado_idx');
            });
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE reportes MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'");
        }

        Schema::create('sanciones_moderacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('moderador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('reporte_id')->nullable()->constrained('reportes')->nullOnDelete();
            $table->string('tipo', 30);
            $table->text('motivo');
            $table->timestamp('inicia_en')->useCurrent();
            $table->timestamp('finaliza_en')->nullable();
            $table->string('estado', 20)->default('activa');
            $table->timestamp('revocada_en')->nullable();
            $table->foreignId('revocada_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->text('razon_revocacion')->nullable();
            $table->index(['usuario_id', 'estado', 'finaliza_en'], 'sanciones_usuario_estado_idx');
        });

        Schema::create('apelaciones_moderacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporte_id')->constrained('reportes')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('sancion_id')->nullable()->constrained('sanciones_moderacion')->cascadeOnDelete();
            $table->text('argumento');
            $table->string('estado', 20)->default('pendiente');
            $table->text('resolucion')->nullable();
            $table->foreignId('revisor_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('fecha')->useCurrent();
            $table->timestamp('resuelta_en')->nullable();
            $table->index(['estado', 'fecha'], 'apelaciones_estado_idx');
        });

        Schema::create('acciones_moderacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moderador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('reporte_id')->nullable()->constrained('reportes')->nullOnDelete();
            $table->foreignId('usuario_afectado_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('accion', 50);
            $table->json('detalle')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->index(['reporte_id', 'fecha'], 'acciones_reporte_idx');
            $table->index(['usuario_afectado_id', 'fecha'], 'acciones_usuario_idx');
        });

        Schema::create('senales_antifraude', function (Blueprint $table) {
            $table->id();
            $table->string('entidad_tipo', 50);
            $table->unsignedBigInteger('entidad_id');
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('regla', 100);
            $table->unsignedSmallInteger('puntaje');
            $table->json('evidencia')->nullable();
            $table->string('estado', 20)->default('revision');
            $table->timestamp('fecha')->useCurrent();
            $table->index(['entidad_tipo', 'entidad_id', 'estado'], 'antifraude_entidad_idx');
            $table->index(['usuario_id', 'estado', 'puntaje'], 'antifraude_usuario_idx');
        });

        Schema::create('auditoria_moderacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('accion', 80);
            $table->string('recurso_tipo', 80);
            $table->unsignedBigInteger('recurso_id')->nullable();
            $table->json('detalle')->nullable();
            $table->string('hash_anterior', 64)->nullable();
            $table->string('hash', 64);
            $table->timestamp('fecha')->useCurrent();
            $table->unique('hash');
            $table->index(['recurso_tipo', 'recurso_id', 'fecha'], 'audit_moderacion_recurso_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria_moderacion');
        Schema::dropIfExists('senales_antifraude');
        Schema::dropIfExists('acciones_moderacion');
        Schema::dropIfExists('apelaciones_moderacion');
        Schema::dropIfExists('sanciones_moderacion');
        if (Schema::hasColumn('reportes', 'prioridad')) {
            Schema::table('reportes', function (Blueprint $table) {
                $table->dropIndex('reportes_cola_idx');
                $table->dropIndex('reportes_contexto_estado_idx');
                $table->dropForeign(['asignado_id']);
                $table->dropColumn([
                    'prioridad', 'asignado_id', 'evidencia', 'asignado_en', 'revision_en',
                    'razon_resolucion', 'sancion_tipo', 'sancion_hasta', 'fingerprint',
                ]);
            });
        }
    }
};
