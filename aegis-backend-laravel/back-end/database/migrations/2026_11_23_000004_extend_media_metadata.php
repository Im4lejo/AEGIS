<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('imagenes_producto', function (Blueprint $table) {
            $table->string('public_id')->nullable()->after('imagen');
            $table->string('mime_type', 100)->nullable()->after('public_id');
            $table->unsignedInteger('size')->nullable()->after('mime_type');
            $table->unsignedInteger('width')->nullable()->after('size');
            $table->unsignedInteger('height')->nullable()->after('width');
            $table->string('alt_text', 255)->nullable()->after('height');
            $table->string('estado', 30)->default('activo')->after('alt_text');
            $table->unsignedTinyInteger('orden')->default(0)->after('principal');
            $table->index(['producto_id', 'estado', 'orden'], 'imagenes_producto_estado_orden_idx');
        });

        Schema::table('imagenes_publicacion_foro', function (Blueprint $table) {
            $table->string('mime_type', 100)->nullable()->after('imagen');
            $table->unsignedInteger('size')->nullable()->after('mime_type');
            $table->unsignedInteger('width')->nullable()->after('size');
            $table->unsignedInteger('height')->nullable()->after('width');
            $table->string('alt_text', 255)->nullable()->after('height');
            $table->string('estado', 30)->default('activo')->after('alt_text');
            $table->index(['publicacion_id', 'estado', 'orden'], 'imagenes_foro_estado_orden_idx');
        });

        Schema::create('operaciones_media', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 100)->unique();
            $table->string('accion', 30);
            $table->string('recurso_tipo', 100);
            $table->unsignedBigInteger('recurso_id');
            $table->string('public_id')->nullable();
            $table->json('payload')->nullable();
            $table->string('estado', 30)->default('pendiente');
            $table->unsignedTinyInteger('intentos')->default(0);
            $table->timestamp('proximo_intento')->nullable();
            $table->timestamp('completado_en')->nullable();
            $table->timestamps();
            $table->index(['estado', 'proximo_intento'], 'operaciones_media_estado_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operaciones_media');

        Schema::table('imagenes_publicacion_foro', function (Blueprint $table) {
            $table->dropIndex('imagenes_foro_estado_orden_idx');
            $table->dropColumn([
                'mime_type',
                'size',
                'width',
                'height',
                'alt_text',
                'estado',
            ]);
        });

        Schema::table('imagenes_producto', function (Blueprint $table) {
            $table->dropIndex('imagenes_producto_estado_orden_idx');
            $table->dropColumn([
                'public_id',
                'mime_type',
                'size',
                'width',
                'height',
                'alt_text',
                'estado',
                'orden',
            ]);
        });
    }
};
