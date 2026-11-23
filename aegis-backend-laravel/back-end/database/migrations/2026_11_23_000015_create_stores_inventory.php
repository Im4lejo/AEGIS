<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tiendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('tipo', ['particular', 'tienda', 'establecimiento'])
                ->default('tienda');
            $table->string('nombre', 150);
            $table->string('slug', 150)->unique();
            $table->text('descripcion')->nullable();
            $table->text('politicas')->nullable();
            $table->json('horario')->nullable();
            $table->json('categorias')->nullable();
            $table->json('enlaces')->nullable();
            $table->string('contacto_permitido', 255)->nullable();
            $table->string('ciudad_aprox', 100)->nullable();
            $table->string('logo_url')->nullable();
            $table->string('logo_id')->nullable();
            $table->string('portada_url')->nullable();
            $table->string('portada_id')->nullable();
            $table->enum('estado', ['activa', 'suspendida', 'archivada'])
                ->default('activa');
            $table->enum('estado_verificacion', ['ninguna', 'pendiente', 'aprobada', 'rechazada', 'revocada'])
                ->default('ninguna');
            $table->timestamp('verificada_en')->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->index(['estado', 'estado_verificacion', 'tipo'], 'tiendas_estado_idx');
        });

        Schema::create('miembros_tienda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tienda_id')->constrained('tiendas')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('rol', ['owner', 'gestor', 'vendedor'])->default('vendedor');
            $table->enum('estado', ['activo', 'suspendido'])->default('activo');
            $table->timestamps();
            $table->unique(['tienda_id', 'usuario_id'], 'membresia_tienda_unica');
            $table->index(['tienda_id', 'rol', 'estado'], 'miembros_tienda_idx');
        });

        Schema::create('verificaciones_tienda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tienda_id')->constrained('tiendas')->cascadeOnDelete();
            $table->foreignId('solicitado_por')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('revisado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada', 'revocada'])
                ->default('pendiente');
            $table->json('documentos')->nullable();
            $table->text('nota')->nullable();
            $table->timestamp('fecha_solicitud')->useCurrent();
            $table->timestamp('fecha_revision')->nullable();
            $table->index(['tienda_id', 'estado', 'fecha_solicitud'], 'verificacion_tienda_idx');
        });

        Schema::create('inventario_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('tienda_id')->nullable()->constrained('tiendas')->nullOnDelete();
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('stock_reservado')->default(0);
            $table->boolean('seguimiento_stock')->default(true);
            $table->timestamp('actualizado_en')->nullable();
            $table->timestamps();
            $table->unique('producto_id');
            $table->index(['tienda_id', 'stock', 'stock_reservado'], 'inventario_tienda_idx');
        });

        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventario_id')->constrained('inventario_producto')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('tipo', ['entrada', 'salida', 'reserva', 'liberacion', 'ajuste'])
                ->default('ajuste');
            $table->integer('cantidad');
            $table->integer('stock_antes');
            $table->integer('stock_despues');
            $table->text('motivo')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->index(['inventario_id', 'fecha'], 'movimientos_inventario_idx');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('tienda_id')->nullable()->after('usuario_id')
                ->constrained('tiendas')->nullOnDelete();
            $table->index(['tienda_id', 'estado_publicacion'], 'productos_tienda_estado_idx');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['tienda_id']);
            $table->dropIndex('productos_tienda_estado_idx');
            $table->dropColumn('tienda_id');
        });
        Schema::dropIfExists('movimientos_inventario');
        Schema::dropIfExists('inventario_producto');
        Schema::dropIfExists('verificaciones_tienda');
        Schema::dropIfExists('miembros_tienda');
        Schema::dropIfExists('tiendas');
    }
};
