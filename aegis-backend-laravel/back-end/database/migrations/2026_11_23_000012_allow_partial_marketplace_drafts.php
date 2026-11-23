<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('categoria_id')->nullable()->change();
            $table->string('titulo', 150)->nullable()->change();
            $table->text('descripcion')->nullable()->change();
            $table->decimal('precio', 12, 2)->nullable()->change();
            $table->string('estado_producto', 30)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('categoria_id')->nullable(false)->change();
            $table->string('titulo', 150)->nullable(false)->change();
            $table->text('descripcion')->nullable(false)->change();
            $table->decimal('precio', 12, 2)->nullable(false)->change();
            $table->string('estado_producto', 30)->nullable(false)->change();
        });
    }
};
