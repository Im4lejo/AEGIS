<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodigoQr extends Model
{
    protected $table = 'codigos_qr';

    public $timestamps = false;

    protected $fillable = ['encuentro_id', 'codigo', 'estado'];

    protected function casts(): array
    {
        return ['fecha_generacion' => 'datetime'];
    }

    public function encuentro(): BelongsTo
    {
        return $this->belongsTo(Encuentro::class, 'encuentro_id');
    }
}
