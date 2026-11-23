<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('historias', 'comunidad_id')) {
            Schema::table('historias', function (Blueprint $table) {
                $table->foreignId('comunidad_id')
                    ->nullable()
                    ->after('usuario_id')
                    ->constrained('comunidades')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('historias', 'comunidad_id')) {
            Schema::table('historias', function (Blueprint $table) {
                $table->dropForeign(['comunidad_id']);
                $table->dropColumn('comunidad_id');
            });
        }
    }
};
