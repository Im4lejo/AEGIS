<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'username' => 'nullable|string|max:50|unique:usuarios,username',
            'email' => 'required|email|max:150|unique:usuarios,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $usuario = Usuario::create([
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'username' => $datos['username'] ?? null,
            'email' => $datos['email'],
            'password' => Hash::make($datos['password']),
            'rol' => 'usuario',
            'estado' => 'activo',
        ]);

        $token = $usuario->createToken('aegis-movil')->plainTextToken;

        return response()->json([
            'message' => 'Cuenta creada correctamente.',
            'usuario' => $usuario,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $datos = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('email', $datos['email'])->first();

        if (
            !$usuario ||
            !Hash::check($datos['password'], $usuario->password)
        ) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        if ($usuario->estado !== 'activo') {
            return response()->json([
                'message' => 'Esta cuenta no está activa.',
            ], 403);
        }

        $token = $usuario->createToken('aegis-movil')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto.',
            'usuario' => $usuario,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }
}
