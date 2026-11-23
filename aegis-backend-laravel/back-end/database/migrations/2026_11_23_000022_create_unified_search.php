<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('busquedas_guardadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->string('termino', 200)->nullable();
            $table->string('entidad', 30)->default('todos');
            $table->json('filtros')->nullable();
            $table->boolean('alerta_activa')->default(false);
            $table->enum('frecuencia', ['diaria', 'semanal'])->default('diaria');
            $table->timestamp('ultima_revision')->nullable();
            $table->timestamps();
            $table->unique(['usuario_id', 'nombre'], 'busqueda_guardada_unica');
            $table->index(['usuario_id', 'alerta_activa', 'frecuencia'], 'alertas_busqueda_idx');
        });

        Schema::create('preferencias_busqueda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('tipo', 30);
            $table->string('valor', 100);
            $table->enum('accion', ['interes', 'silenciar', 'no_interesa'])->default('interes');
            $table->timestamps();
            $table->unique(['usuario_id', 'tipo', 'valor'], 'preferencia_busqueda_unica');
        });

        Schema::create('historial_busqueda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('sesion_key', 100)->nullable();
            $table->string('termino', 200);
            $table->string('entidad', 30)->default('todos');
            $table->timestamp('fecha')->useCurrent();
            $table->index(['usuario_id', 'fecha'], 'historial_busqueda_usuario_idx');
            $table->index(['sesion_key', 'fecha'], 'historial_busqueda_sesion_idx');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            try {
                DB::statement('CREATE INDEX productos_busqueda_idx ON productos (titulo)');
                DB::statement('CREATE INDEX publicaciones_busqueda_idx ON publicaciones_foro (titulo)');
                DB::statement('CREATE INDEX usuarios_busqueda_idx ON usuarios (nombre, username)');
                DB::statement('CREATE INDEX comunidades_busqueda_idx ON comunidades (nombre)');
            } catch (Throwable) {
                // Existing engines or names may already provide equivalent indexes.
            }
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            foreach ([
                'productos_busqueda_idx',
                'publicaciones_busqueda_idx',
                'usuarios_busqueda_idx',
                'comunidades_busqueda_idx',
            ] as $index) {
                try {
                    DB::statement('DROP INDEX '.$index.' ON '.
                        match ($index) {
                            'productos_busqueda_idx' => 'productos',
                            'publicaciones_busqueda_idx' => 'publicaciones_foro',
                            'usuarios_busqueda_idx' => 'usuarios',
                            'comunidades_busqueda_idx' => 'comunidades',
                        });
                } catch (Throwable) {
                }
            }
        }
        Schema::dropIfExists('historial_busqueda');
        Schema::dropIfExists('preferencias_busqueda');
        Schema::dropIfExists('busquedas_guardadas');
    }
};
