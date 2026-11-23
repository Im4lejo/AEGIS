<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seguimiento extends Model
{
    protected $table = 'seguimientos';

    protected $fillable = ['seguidor_id', 'seguido_id', 'estado'];

    public function seguidor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'seguidor_id');
    }

    public function seguido(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'seguido_id');
    }
}
