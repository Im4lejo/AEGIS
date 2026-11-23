<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preferencias_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->json('preferencias');
            $table->timestamp('ultima_sincronizacion')->nullable();
            $table->timestamps();
            $table->unique('usuario_id');
            $table->index(['usuario_id', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferencias_usuario');
    }
};
