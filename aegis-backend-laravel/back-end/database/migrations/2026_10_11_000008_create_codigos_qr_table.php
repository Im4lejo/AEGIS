<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('codigos_qr', function (Blueprint $table) {
            $table->id();
            $table->foreignId('encuentro_id')->unique()
                ->constrained('encuentros')->cascadeOnDelete();
            $table->string('codigo');
            $table->enum('estado', ['activo', 'usado', 'expirado'])->default('activo');
            $table->timestamp('fecha_generacion')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('codigos_qr');
    }
};
