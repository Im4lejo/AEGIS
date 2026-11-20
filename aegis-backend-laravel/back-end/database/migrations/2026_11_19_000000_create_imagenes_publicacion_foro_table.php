<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imagenes_publicacion_foro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')
                ->constrained('publicaciones_foro')
                ->cascadeOnDelete();
            $table->text('imagen');
            $table->string('public_id');
            $table->unsignedTinyInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imagenes_publicacion_foro');
    }
};
