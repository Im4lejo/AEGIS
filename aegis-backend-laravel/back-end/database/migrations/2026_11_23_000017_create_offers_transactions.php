<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ofertas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('comprador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('vendedor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('conversacion_id')->nullable()->constrained('conversaciones')->nullOnDelete();
            $table->decimal('monto', 12, 2);
            $table->enum('estado', ['pendiente', 'aceptada', 'rechazada', 'contraoferta', 'retirada', 'expirada', 'cancelada'])
                ->default('pendiente');
            $table->timestamp('expira_en')->nullable();
            $table->text('mensaje')->nullable();
            $table->timestamps();
            $table->index(['comprador_id', 'estado', 'created_at'], 'ofertas_comprador_idx');
            $table->index(['vendedor_id', 'estado', 'created_at'], 'ofertas_vendedor_idx');
            $table->index(['producto_id', 'estado', 'expira_en'], 'ofertas_producto_idx');
            $table->unique(['producto_id', 'comprador_id', 'estado'], 'oferta_unica_activa');
        });

        Schema::create('historial_oferta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('oferta_id')->constrained('ofertas')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('accion', 50);
            $table->string('estado_anterior', 30)->nullable();
            $table->string('estado_nuevo', 30);
            $table->decimal('monto_anterior', 12, 2)->nullable();
            $table->decimal('monto_nuevo', 12, 2)->nullable();
            $table->text('nota')->nullable();
            $table->timestamp('fecha')->useCurrent();
        });

        Schema::create('reservas_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('comprador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('oferta_id')->nullable()->constrained('ofertas')->nullOnDelete();
            $table->enum('estado', ['activa', 'liberada', 'convertida'])->default('activa');
            $table->timestamp('expira_en')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->unique(['producto_id', 'comprador_id', 'estado'], 'reserva_producto_unica');
        });

        Schema::create('operaciones_comerciales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('comprador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('vendedor_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('oferta_id')->nullable()->constrained('ofertas')->nullOnDelete();
            $table->foreignId('conversacion_id')->nullable()->constrained('conversaciones')->nullOnDelete();
            $table->foreignId('encuentro_id')->nullable()->constrained('encuentros')->nullOnDelete();
            $table->decimal('monto_acordado', 12, 2);
            $table->enum('estado', ['pendiente', 'acordada', 'completada', 'cancelada', 'disputa'])
                ->default('pendiente');
            $table->timestamp('fecha_acuerdo')->nullable();
            $table->timestamp('fecha_completada')->nullable();
            $table->timestamps();
            $table->unique(['producto_id', 'comprador_id'], 'operacion_producto_comprador');
            $table->index(['vendedor_id', 'estado', 'created_at'], 'operaciones_vendedor_idx');
            $table->index(['comprador_id', 'estado', 'created_at'], 'operaciones_comprador_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operaciones_comerciales');
        Schema::dropIfExists('reservas_producto');
        Schema::dropIfExists('historial_oferta');
        Schema::dropIfExists('ofertas');
    }
};
