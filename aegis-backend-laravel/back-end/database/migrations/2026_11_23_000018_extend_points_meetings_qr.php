<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('puntos_fisicos', function (Blueprint $table) {
            $table->json('servicios')->nullable()->after('imagen');
            $table->text('reglas')->nullable()->after('servicios');
            $table->decimal('latitud', 10, 7)->nullable()->after('ciudad');
            $table->decimal('longitud', 10, 7)->nullable()->after('latitud');
            $table->string('estado_revision', 30)->default('aprobado')->after('estado');
            $table->index(['estado', 'estado_revision', 'ciudad'], 'puntos_directorio_idx');
        });

        Schema::table('encuentros', function (Blueprint $table) {
            $table->string('estado', 30)->default('pendiente')->change();
            $table->timestamp('expira_en')->nullable()->after('fecha_creacion');
            $table->text('notas')->nullable()->after('expira_en');
            $table->timestamp('confirmado_en')->nullable()->after('notas');
            $table->timestamp('cancelado_en')->nullable()->after('confirmado_en');
            $table->timestamp('finalizado_en')->nullable()->after('cancelado_en');
            $table->foreignId('operacion_id')->nullable()->after('punto_fisico_id')
                ->constrained('operaciones_comerciales')->nullOnDelete();
            $table->index(['comprador_id', 'estado', 'fecha_encuentro'], 'encuentros_comprador_idx');
            $table->index(['vendedor_id', 'estado', 'fecha_encuentro'], 'encuentros_vendedor_idx');
        });

        Schema::table('codigos_qr', function (Blueprint $table) {
            $table->string('estado', 30)->default('activo')->change();
            $table->string('token_hash', 64)->nullable()->after('codigo');
            $table->timestamp('expira_en')->nullable()->after('fecha_generacion');
            $table->timestamp('usado_en')->nullable()->after('expira_en');
            $table->foreignId('validado_por')->nullable()->after('usado_en')
                ->constrained('usuarios')->nullOnDelete();
            $table->json('evidencia')->nullable()->after('validado_por');
            $table->index(['estado', 'expira_en'], 'qr_estado_expira_idx');
        });

        Schema::create('historial_encuentro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuentro_id')->constrained('encuentros')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('accion', 100);
            $table->string('estado_anterior', 30)->nullable();
            $table->string('estado_nuevo', 30);
            $table->text('nota')->nullable();
            $table->timestamp('fecha')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_encuentro');
        Schema::table('codigos_qr', function (Blueprint $table) {
            $table->dropIndex('qr_estado_expira_idx');
            $table->dropForeign(['validado_por']);
            $table->dropColumn(['token_hash', 'expira_en', 'usado_en', 'validado_por', 'evidencia']);
        });
        Schema::table('encuentros', function (Blueprint $table) {
            $table->dropForeign(['operacion_id']);
            $table->dropIndex('encuentros_comprador_idx');
            $table->dropIndex('encuentros_vendedor_idx');
            $table->dropColumn(['expira_en', 'notas', 'confirmado_en', 'cancelado_en', 'finalizado_en', 'operacion_id']);
        });
        Schema::table('puntos_fisicos', function (Blueprint $table) {
            $table->dropIndex('puntos_directorio_idx');
            $table->dropColumn(['servicios', 'reglas', 'latitud', 'longitud', 'estado_revision']);
        });
    }
};
