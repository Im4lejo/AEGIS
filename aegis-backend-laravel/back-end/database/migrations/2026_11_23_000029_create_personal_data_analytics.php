<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos_comerciales_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->string('tipo', 40);
            $table->string('fingerprint', 64);
            $table->timestamp('fecha')->useCurrent();
            $table->index(['producto_id', 'tipo', 'fecha'], 'eventos_comerciales_producto_idx');
            $table->index(['usuario_id', 'tipo', 'fecha'], 'eventos_comerciales_usuario_idx');
            $table->unique(['fingerprint', 'tipo'], 'eventos_comerciales_dedupe');
        });

        Schema::create('rollups_comerciales_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->date('fecha');
            $table->string('tipo', 40);
            $table->unsignedInteger('cantidad')->default(0);
            $table->timestamp('actualizado_en')->useCurrent();
            $table->unique(['usuario_id', 'producto_id', 'fecha', 'tipo'], 'rollups_comerciales_unico');
            $table->index(['usuario_id', 'fecha', 'tipo'], 'rollups_comerciales_periodo_idx');
        });

        Schema::create('solicitudes_privacidad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('tipo', 30);
            $table->string('estado', 30)->default('solicitada');
            $table->text('motivo')->nullable();
            $table->timestamp('fecha_solicitud')->useCurrent();
            $table->timestamp('fecha_revision')->nullable();
            $table->timestamp('fecha_cumplimiento')->nullable();
            $table->foreignId('revisada_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->text('nota_interna')->nullable();
            $table->index(['usuario_id', 'tipo', 'estado'], 'solicitudes_privacidad_usuario_idx');
        });

        Schema::create('exportaciones_datos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('formato', 20)->default('json');
            $table->string('estado', 30)->default('solicitada');
            $table->timestamp('fecha_solicitud')->useCurrent();
            $table->timestamp('fecha_generacion')->nullable();
            $table->timestamp('expira_en')->nullable();
            $table->text('ruta')->nullable();
            $table->string('hash_archivo', 64)->nullable();
            $table->index(['usuario_id', 'estado', 'fecha_solicitud'], 'exportaciones_usuario_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exportaciones_datos');
        Schema::dropIfExists('solicitudes_privacidad');
        Schema::dropIfExists('rollups_comerciales_usuario');
        Schema::dropIfExists('eventos_comerciales_usuario');
    }
};
