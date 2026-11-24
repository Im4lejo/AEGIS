<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function hasIndex(string $tableName, string $indexName): bool
    {
        if (DB::getDriverName() === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('{$tableName}')");
            foreach ($indexes as $index) {
                if (($index->name ?? null) === $indexName) {
                    return true;
                }
            }
            return false;
        }
        $indexes = DB::select("SHOW INDEX FROM `{$tableName}`");
        foreach ($indexes as $index) {
            if (($index->Key_name ?? null) === $indexName) {
                return true;
            }
        }
        return false;
    }

    public function up(): void
    {
        if (Schema::hasTable('productos')) {
            if (! $this->hasIndex('productos', 'productos_ruta_publica_fecha_idx')
                && Schema::hasColumn('productos', 'fecha_publicacion')
            ) {
                Schema::table('productos', function (Blueprint $table) {
                    $table->index(
                        ['estado_publicacion', 'visibilidad', 'fecha_publicacion', 'id'],
                        'productos_ruta_publica_fecha_idx',
                    );
                });
            }
        }
        if (Schema::hasTable('publicaciones_foro')) {
            if (! $this->hasIndex('publicaciones_foro', 'publicaciones_ruta_feed_fecha_idx')) {
                Schema::table('publicaciones_foro', function (Blueprint $table) {
                    $table->index(
                        ['estado', 'visibilidad', 'fecha_publicacion', 'id'],
                        'publicaciones_ruta_feed_fecha_idx',
                    );
                });
            }
        }
        if (Schema::hasTable('mensajes')) {
            if (! $this->hasIndex('mensajes', 'mensajes_conversacion_feed_idx')) {
                Schema::table('mensajes', function (Blueprint $table) {
                    $table->index(
                        ['conversacion_id', 'estado', 'fecha_envio', 'id'],
                        'mensajes_conversacion_feed_idx',
                    );
                });
            }
        }
        if (Schema::hasTable('notificaciones')) {
            if (! $this->hasIndex('notificaciones', 'notificaciones_usuario_feed_v2_idx')
                && Schema::hasColumn('notificaciones', 'archivada_en')
            ) {
                Schema::table('notificaciones', function (Blueprint $table) {
                    $table->index(
                        ['usuario_id', 'leida', 'archivada_en', 'fecha_creacion', 'id'],
                        'notificaciones_usuario_feed_v2_idx',
                    );
                });
            }
        }
    }

    public function down(): void
    {
        foreach ([
            'productos' => 'productos_ruta_publica_fecha_idx',
            'publicaciones_foro' => 'publicaciones_ruta_feed_fecha_idx',
            'mensajes' => 'mensajes_conversacion_feed_idx',
            'notificaciones' => 'notificaciones_usuario_feed_v2_idx',
        ] as $tableName => $indexName) {
            if (Schema::hasTable($tableName)) {
                if ($this->hasIndex($tableName, $indexName)) {
                    Schema::table($tableName, function (Blueprint $table) use ($indexName): void {
                        $table->dropIndex($indexName);
                    });
                }
            }
        }
    }
};
