<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calificaciones', function (Blueprint $table) {
            $table->enum('ambito', ['vendedor', 'comprador', 'punto'])->default('vendedor')
                ->after('receptor_id');
            $table->enum('estado', ['activa', 'editada', 'disputada', 'anulada'])
                ->default('activa')
                ->after('ambito');
            $table->text('respuesta')->nullable()->after('comentario');
            $table->timestamp('respondida_en')->nullable()->after('respuesta');
            $table->timestamp('editada_en')->nullable()->after('respondida_en');
            $table->timestamp('anulada_en')->nullable()->after('editada_en');
            $table->foreignId('punto_fisico_id')->nullable()->after('encuentro_id')
                ->constrained('puntos_fisicos')->nullOnDelete();
            $table->index(['receptor_id', 'ambito', 'estado', 'fecha_calificacion'], 'calificaciones_receptor_idx');
            $table->index(['autor_id', 'estado', 'fecha_calificacion'], 'calificaciones_autor_idx');
        });

        try {
            Schema::table('calificaciones', function (Blueprint $table) {
                $table->unique(
                    ['encuentro_id', 'autor_id', 'ambito'],
                    'calificacion_encuentro_autor_unica',
                );
            });
        } catch (Throwable) {
            // Duplicates are audited but not silently modified.
        }

        DB::table('calificaciones')
            ->whereNull('punto_fisico_id')
            ->update([
                'punto_fisico_id' => DB::raw(
                    '(SELECT punto_fisico_id FROM encuentros WHERE encuentros.id = calificaciones.encuentro_id)'
                ),
            ]);

        Schema::create('reputacion_agregados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('punto_fisico_id')->nullable()->constrained('puntos_fisicos')->cascadeOnDelete();
            $table->enum('ambito', ['vendedor', 'comprador', 'punto']);
            $table->unsignedInteger('cantidad')->default(0);
            $table->decimal('promedio', 4, 2)->default(0);
            $table->json('distribucion')->nullable();
            $table->timestamp('actualizado_en')->useCurrent();
            $table->unique(['usuario_id', 'ambito'], 'reputacion_usuario_unica');
            $table->unique(['punto_fisico_id', 'ambito'], 'reputacion_punto_unica');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reputacion_agregados');
        Schema::table('calificaciones', function (Blueprint $table) {
            $table->dropUnique('calificacion_encuentro_autor_unica');
            $table->dropForeign(['punto_fisico_id']);
            $table->dropIndex('calificaciones_receptor_idx');
            $table->dropIndex('calificaciones_autor_idx');
            $table->dropColumn([
                'ambito',
                'estado',
                'respuesta',
                'respondida_en',
                'editada_en',
                'anulada_en',
                'punto_fisico_id',
            ]);
        });
    }
};
