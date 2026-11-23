<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('busquedas_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('sesion_key', 100)->nullable();
            $table->json('filtros');
            $table->unsignedInteger('veces')->default(1);
            $table->timestamp('ultima_busqueda')->useCurrent();
            $table->index(['usuario_id', 'ultima_busqueda'], 'busquedas_usuario_idx');
            $table->index(['sesion_key', 'ultima_busqueda'], 'busquedas_sesion_idx');
        });

        Schema::create('comparaciones_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('sesion_key', 100)->nullable();
            $table->string('producto_ids', 255);
            $table->timestamp('fecha')->useCurrent();
            $table->index(['usuario_id', 'fecha'], 'comparaciones_usuario_idx');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->index(['ciudad_aprox', 'estado_publicacion', 'precio'], 'productos_ciudad_precio_idx');
            $table->index(['estado_publicacion', 'fecha_publicacion', 'precio'], 'productos_recencia_precio_idx');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropIndex('productos_ciudad_precio_idx');
            $table->dropIndex('productos_recencia_precio_idx');
        });
        Schema::dropIfExists('comparaciones_producto');
        Schema::dropIfExists('busquedas_productos');
    }
};
