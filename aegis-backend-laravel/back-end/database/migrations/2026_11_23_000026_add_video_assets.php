<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['imagenes_publicacion_foro', 'historias'] as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }
            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                if (! Schema::hasColumn($tableName, 'poster_url')) {
                    $table->text('poster_url')->nullable();
                }
                if (! Schema::hasColumn($tableName, 'playback_url')) {
                    $table->text('playback_url')->nullable();
                }
                if (! Schema::hasColumn($tableName, 'subtitulos_url')) {
                    $table->text('subtitulos_url')->nullable();
                }
                if (! Schema::hasColumn($tableName, 'procesamiento_estado')) {
                    $table->string('procesamiento_estado', 30)->default('listo');
                }
            });
        }

        if (! Schema::hasTable('sesiones_live')) {
            Schema::create('sesiones_live', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
                $table->string('proveedor', 50);
                $table->string('estado', 30)->default('no_disponible');
                $table->text('motivo')->nullable();
                $table->timestamp('creada_en')->useCurrent();
                $table->timestamp('finalizada_en')->nullable();
                $table->index(['usuario_id', 'estado', 'creada_en']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones_live');
        foreach (['imagenes_publicacion_foro', 'historias'] as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }
            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                $columns = ['poster_url', 'playback_url', 'subtitulos_url', 'procesamiento_estado'];
                $existing = array_values(array_filter(
                    $columns,
                    fn (string $column) => Schema::hasColumn($tableName, $column),
                ));
                if ($existing !== []) {
                    $table->dropColumn($existing);
                }
            });
        }
    }
};
