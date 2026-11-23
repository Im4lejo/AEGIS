<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->string('titulo_breve', 150)->nullable()->after('titulo');
            $table->json('atributos')->nullable()->after('ciudad');
            $table->string('ciudad_aprox', 100)->nullable()->after('atributos');
            $table->timestamp('fecha_estado')->nullable()->after('fecha_publicacion');
            $table->timestamp('fecha_renovacion')->nullable()->after('fecha_estado');
            $table->timestamp('editado_en')->nullable()->after('fecha_renovacion');
            $table->string('motivo_archivo', 255)->nullable()->after('editado_en');
            $table->unsignedInteger('vistas')->default(0)->after('motivo_archivo');
            $table->index(['usuario_id', 'estado_publicacion', 'fecha_publicacion'], 'productos_owner_estado_idx');
            $table->index(['estado_publicacion', 'precio', 'fecha_publicacion'], 'productos_catalogo_precio_idx');
            $table->index(['categoria_id', 'estado_publicacion', 'estado_producto'], 'productos_categoria_estado_idx');
        });

        Schema::create('historial_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('accion', 100);
            $table->string('estado_anterior', 30)->nullable();
            $table->string('estado_nuevo', 30);
            $table->json('datos')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->index(['producto_id', 'fecha'], 'historial_producto_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_producto');

        Schema::table('productos', function (Blueprint $table) {
            $table->dropIndex('productos_owner_estado_idx');
            $table->dropIndex('productos_catalogo_precio_idx');
            $table->dropIndex('productos_categoria_estado_idx');
            $table->dropColumn([
                'titulo_breve',
                'atributos',
                'ciudad_aprox',
                'fecha_estado',
                'fecha_renovacion',
                'editado_en',
                'motivo_archivo',
                'vistas',
            ]);
        });
    }
};
