<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ExpirarOfertas;
use App\Models\HistorialOferta;
use App\Models\InventarioProducto;
use App\Models\Oferta;
use App\Models\OperacionComercial;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class NegociacionController extends Controller
{
    public function mine(Request $request)
    {
        ExpirarOfertas::dispatchSync();
        $offers = Oferta::query()
            ->where(fn ($q) => $q
                ->where('comprador_id', $request->user()->id)
                ->orWhere('vendedor_id', $request->user()->id))
            ->with(['producto:id,titulo,precio,estado_publicacion'])
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));
        $operations = OperacionComercial::query()
            ->where(fn ($q) => $q
                ->where('comprador_id', $request->user()->id)
                ->orWhere('vendedor_id', $request->user()->id))
            ->with('producto:id,titulo,precio')
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'ofertas' => $offers,
            'operaciones' => $operations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'monto' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'mensaje' => ['nullable', 'string', 'max:2000'],
            'conversacion_id' => ['nullable', 'integer', 'exists:conversaciones,id'],
        ]);

        $result = DB::transaction(function () use ($request, $validated) {
            $product = Producto::query()->lockForUpdate()->findOrFail($validated['producto_id']);
            if ((int) $product->usuario_id === (int) $request->user()->id) {
                throw ValidationException::withMessages(['producto_id' => ['No puedes ofertar por tu propio anuncio.']]);
            }
            if ($product->estado_publicacion !== 'activo' || $product->visibilidad !== 'publica') {
                throw ValidationException::withMessages(['producto_id' => ['El anuncio no acepta ofertas.']]);
            }
            $active = Oferta::query()
                ->where('producto_id', $product->id)
                ->where('comprador_id', $request->user()->id)
                ->whereIn('estado', ['pendiente', 'contraoferta'])
                ->exists();
            if ($active) {
                throw ValidationException::withMessages(['oferta' => ['Ya tienes una oferta activa para este anuncio.']]);
            }

            $offer = Oferta::query()->create([
                'producto_id' => $product->id,
                'comprador_id' => $request->user()->id,
                'vendedor_id' => $product->usuario_id,
                'conversacion_id' => $validated['conversacion_id'] ?? null,
                'monto' => $validated['monto'],
                'estado' => 'pendiente',
                'expira_en' => now()->addHours(48),
                'mensaje' => $validated['mensaje'] ?? null,
            ]);
            HistorialOferta::query()->create([
                'oferta_id' => $offer->id,
                'actor_id' => $request->user()->id,
                'accion' => 'crear',
                'estado_nuevo' => 'pendiente',
                'monto_nuevo' => $validated['monto'],
                'nota' => $validated['mensaje'] ?? null,
            ]);

            return $offer;
        });

        return response()->json(['data' => $result->load(['producto', 'comprador', 'vendedor'])], 201);
    }

    public function counter(Request $request, int $oferta)
    {
        $validated = $request->validate([
            'monto' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'mensaje' => ['nullable', 'string', 'max:2000'],
        ]);
        $result = DB::transaction(function () use ($request, $oferta, $validated) {
            $offer = Oferta::query()->lockForUpdate()->findOrFail($oferta);
            $this->expireIfNeeded($offer);
            if (! in_array($offer->estado, ['pendiente', 'contraoferta'], true)) {
                throw ValidationException::withMessages(['oferta' => ['La oferta ya no admite contraoferta.']]);
            }
            $isBuyer = (int) $offer->comprador_id === (int) $request->user()->id;
            $isSeller = (int) $offer->vendedor_id === (int) $request->user()->id;
            if (! $isBuyer && ! $isSeller) {
                return abort(403, 'Sin permiso.');
            }
            $previous = $offer->estado;
            $oldAmount = $offer->monto;
            $offer->update([
                'monto' => $validated['monto'],
                'estado' => 'contraoferta',
                'expira_en' => now()->addHours(48),
                'mensaje' => $validated['mensaje'] ?? $offer->mensaje,
            ]);
            HistorialOferta::query()->create([
                'oferta_id' => $offer->id,
                'actor_id' => $request->user()->id,
                'accion' => 'contraoferta',
                'estado_anterior' => $previous,
                'estado_nuevo' => 'contraoferta',
                'monto_anterior' => $oldAmount,
                'monto_nuevo' => $validated['monto'],
                'nota' => $validated['mensaje'] ?? null,
            ]);

            return $offer;
        });

        return response()->json(['data' => $result]);
    }

    public function decide(Request $request, int $oferta)
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:aceptada,rechazada,retirada,cancelada'],
        ]);
        $result = DB::transaction(function () use ($request, $oferta, $validated) {
            $offer = Oferta::query()->lockForUpdate()->findOrFail($oferta);
            $this->expireIfNeeded($offer);
            $buyer = (int) $offer->comprador_id === (int) $request->user()->id;
            $seller = (int) $offer->vendedor_id === (int) $request->user()->id;
            if (! $buyer && ! $seller) {
                abort(403, 'Sin permiso.');
            }
            if ($validated['decision'] === 'retirada' && ! $buyer) {
                throw ValidationException::withMessages(['decision' => ['Solo el comprador puede retirar.']]);
            }
            if (in_array($validated['decision'], ['aceptada', 'rechazada'], true) && ! $seller) {
                throw ValidationException::withMessages(['decision' => ['Solo el vendedor puede aceptar o rechazar.']]);
            }
            if (! in_array($offer->estado, ['pendiente', 'contraoferta'], true)) {
                throw ValidationException::withMessages(['oferta' => ['La oferta no está activa.']]);
            }

            $previous = $offer->estado;
            $offer->update(['estado' => $validated['decision']]);
            HistorialOferta::query()->create([
                'oferta_id' => $offer->id,
                'actor_id' => $request->user()->id,
                'accion' => $validated['decision'],
                'estado_anterior' => $previous,
                'estado_nuevo' => $validated['decision'],
                'monto_anterior' => $offer->monto,
                'monto_nuevo' => $offer->monto,
            ]);

            $operation = null;
            $reservation = null;
            if ($validated['decision'] === 'aceptada') {
                $operation = OperacionComercial::query()->firstOrCreate([
                    'producto_id' => $offer->producto_id,
                    'comprador_id' => $offer->comprador_id,
                ], [
                    'vendedor_id' => $offer->vendedor_id,
                    'oferta_id' => $offer->id,
                    'conversacion_id' => $offer->conversacion_id,
                    'monto_acordado' => $offer->monto,
                    'estado' => 'pendiente',
                ]);

                $product = Producto::query()->lockForUpdate()->findOrFail($offer->producto_id);
                if ($product->estado_publicacion !== 'activo') {
                    throw ValidationException::withMessages(['producto' => ['El anuncio ya no está disponible.']]);
                }
                $inventory = InventarioProducto::query()->where('producto_id', $product->id)->lockForUpdate()->first();
                if ($inventory && $inventory->stock <= $inventory->stock_reservado) {
                    throw ValidationException::withMessages(['producto' => ['No hay unidades disponibles.']]);
                }
                if ($inventory) {
                    $inventory->update([
                        'stock_reservado' => $inventory->stock_reservado + 1,
                        'actualizado_en' => now(),
                    ]);
                }
                $reservation = DB::table('reservas_producto')->insertGetId([
                    'producto_id' => $offer->producto_id,
                    'comprador_id' => $offer->comprador_id,
                    'oferta_id' => $offer->id,
                    'estado' => 'activa',
                    'expira_en' => now()->addDays(3),
                    'fecha' => now(),
                ]);
                $product->update(['estado_publicacion' => 'reservado', 'fecha_estado' => now()]);
            }

            return [$offer, $operation, $reservation];
        });
        [$offer, $operation, $reservation] = $result;

        return response()->json(['data' => ['oferta' => $offer, 'operacion' => $operation, 'reserva_id' => $reservation]]);
    }

    public function transitionOperation(Request $request, int $operacion)
    {
        $validated = $request->validate([
            'estado' => ['required', 'in:acordada,completada,cancelada,disputa'],
        ]);
        $operation = OperacionComercial::query()->lockForUpdate()->findOrFail($operacion);
        $userId = $request->user()->id;
        if (! in_array($userId, [(int) $operation->comprador_id, (int) $operation->vendedor_id], true)
            && $request->user()->rol !== 'admin'
        ) {
            abort(403, 'Sin permiso.');
        }
        if ($validated['estado'] === 'completada' && $userId !== (int) $operation->vendedor_id && $request->user()->rol !== 'admin') {
            throw ValidationException::withMessages(['estado' => ['Solo el vendedor puede completar.']]);
        }
        $operation->update([
            'estado' => $validated['estado'],
            'fecha_acuerdo' => $validated['estado'] === 'acordada' ? now() : $operation->fecha_acuerdo,
            'fecha_completada' => $validated['estado'] === 'completada' ? now() : $operation->fecha_completada,
        ]);
        if ($validated['estado'] === 'completada') {
            $operation->producto()->update(['estado_publicacion' => 'vendido', 'fecha_estado' => now()]);
        }
        if (in_array($validated['estado'], ['cancelada', 'completada'], true)) {
            DB::table('reservas_producto')
                ->where('oferta_id', $operation->oferta_id)
                ->update(['estado' => $validated['estado'] === 'completada' ? 'convertida' : 'liberada']);
        }

        return response()->json(['data' => $operation->fresh()]);
    }

    private function expireIfNeeded(Oferta $offer): void
    {
        if ($offer->expira_en && now()->greaterThan($offer->expira_en)
            && in_array($offer->estado, ['pendiente', 'contraoferta'], true)
        ) {
            $offer->update(['estado' => 'expirada']);
        }
    }
}
