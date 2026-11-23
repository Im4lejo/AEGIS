<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->enum('categoria', [
                'social', 'marketplace', 'comunidad', 'seguridad', 'sistema',
            ])->default('sistema')->after('usuario_id');
            $table->string('tipo', 100)->default('sistema')->after('categoria');
            $table->foreignId('actor_id')->nullable()->after('tipo')
                ->constrained('usuarios')->nullOnDelete();
            $table->string('objeto_tipo', 100)->nullable()->after('actor_id');
            $table->unsignedBigInteger('objeto_id')->nullable()->after('objeto_tipo');
            $table->string('destino', 255)->nullable()->after('objeto_id');
            $table->string('dedupe_key', 191)->nullable()->after('destino');
            $table->timestamp('leida_en')->nullable()->after('leida');
            $table->timestamp('archivada_en')->nullable()->after('leida_en');
            $table->index(['usuario_id', 'categoria', 'leida', 'fecha_creacion'], 'notificaciones_bandeja_idx');
            $table->index(['usuario_id', 'archivada_en', 'fecha_creacion'], 'notificaciones_archivo_idx');
            $table->unique(['usuario_id', 'dedupe_key'], 'notificaciones_dedupe_unica');
        });

        Schema::create('preferencias_notificacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('categoria', [
                'social', 'marketplace', 'comunidad', 'seguridad', 'sistema',
            ]);
            $table->boolean('in_app')->default(true);
            $table->boolean('email')->default(false);
            $table->boolean('push_web')->default(false);
            $table->timestamps();
            $table->unique(['usuario_id', 'categoria'], 'preferencia_usuario_categoria');
        });

        DB::table('notificaciones')
            ->whereNull('tipo')
            ->update(['tipo' => 'sistema']);
        DB::table('notificaciones')
            ->whereNull('categoria')
            ->update(['categoria' => 'seguridad']);
    }

    public function down(): void
    {
        Schema::dropIfExists('preferencias_notificacion');
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropUnique('notificaciones_dedupe_unica');
            $table->dropIndex('notificaciones_bandeja_idx');
            $table->dropIndex('notificaciones_archivo_idx');
            $table->dropForeign(['actor_id']);
            $table->dropColumn([
                'categoria',
                'tipo',
                'actor_id',
                'objeto_tipo',
                'objeto_id',
                'destino',
                'dedupe_key',
                'leida_en',
                'archivada_en',
            ]);
        });
    }
};
