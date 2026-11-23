<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preguntas_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->text('pregunta');
            $table->text('respuesta')->nullable();
            $table->foreignId('respondido_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'respondida', 'oculta', 'eliminada'])
                ->default('pendiente');
            $table->timestamp('fecha_pregunta')->useCurrent();
            $table->timestamp('fecha_respuesta')->nullable();
            $table->timestamp('editada_en')->nullable();
            $table->index(['producto_id', 'estado', 'fecha_pregunta'], 'preguntas_producto_idx');
            $table->index(['usuario_id', 'estado'], 'preguntas_usuario_idx');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->text('politicas')->nullable()->after('descripcion');
            $table->string('entrega_aprox', 255)->nullable()->after('ciudad_aprox');
            $table->string('metodo_entrega', 255)->nullable()->after('entrega_aprox');
            $table->boolean('permite_encuentro')->default(true)->after('metodo_entrega');
            $table->timestamp('fecha_disponibilidad')->nullable()->after('permite_encuentro');
            $table->index(['estado_publicacion', 'permite_encuentro', 'fecha_disponibilidad'], 'productos_disponibilidad_idx');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropIndex('productos_disponibilidad_idx');
            $table->dropColumn([
                'politicas',
                'entrega_aprox',
                'metodo_entrega',
                'permite_encuentro',
                'fecha_disponibilidad',
            ]);
        });
        Schema::dropIfExists('preguntas_producto');
    }
};
