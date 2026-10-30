<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('username', 50)->nullable()->unique();
            $table->string('email', 150)->unique();
            $table->string('password');
            $table->string('telefono', 20)->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->string('img_background_url');
            $table->string('img_background_id');
            $table->string('foto_perfil_url')->default('default.png');
            $table->string('foto_perfil_id');
            $table->text('descripcion')->nullable();
            $table->decimal('reputacion', 3, 2)->default(5);
            $table->enum('rol', ['usuario', 'owner', 'admin'])->default('usuario');
            $table->enum('estado', ['activo', 'suspendido', 'baneado'])->default('activo');
            $table->timestamp('fecha_registro')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
