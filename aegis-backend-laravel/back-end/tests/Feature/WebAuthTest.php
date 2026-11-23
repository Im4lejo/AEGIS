<?php

namespace Tests\Feature;

use App\Models\Notificacion;
use App\Models\User;
use App\Models\Usuario;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class WebAuthTest extends TestCase
{
    use RefreshDatabase;

    private int $userNumber = 0;

    public function test_web_registration_is_generic_and_sends_verification(): void
    {
        Notification::fake();

        $payload = [
            'nombre' => 'Ana',
            'apellido' => 'Pérez',
            'username' => 'ana-web',
            'email' => 'ana-web@example.com',
            'password' => 'StrongPassword123',
            'password_confirmation' => 'StrongPassword123',
        ];

        $first = $this->postJson('/api/auth/web/register', $payload)
            ->assertAccepted()
            ->assertJsonMissingPath('token');

        $user = Usuario::query()->where('email', $payload['email'])->firstOrFail();
        $this->assertNull($user->email_verified_at);
        $this->assertTrue(Hash::check($payload['password'], $user->password));
        Notification::assertSentTo($user, VerifyEmail::class);

        $duplicate = $this->postJson('/api/auth/web/register', array_merge($payload, [
            'username' => 'ana-web-duplicate',
        ]))
            ->assertAccepted();

        $this->assertSame($first->json(), $duplicate->json());
        $this->assertDatabaseCount('usuarios', 1);
    }

    public function test_signed_verification_link_marks_usuario_verified(): void
    {
        $user = $this->createUser();
        $url = URL::temporarySignedRoute(
            'auth.web.verify',
            now()->addMinutes(30),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($url)
            ->assertRedirect('http://localhost:5173/#/email-verified?status=verified');

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->get('/api/auth/web/email/verify/'.$user->id.'/'.sha1($user->email))
            ->assertForbidden();
    }

    public function test_web_login_requires_active_verified_user_and_issues_eight_hour_token(): void
    {
        $user = $this->createUser([
            'email' => 'web-login@example.com',
            'password' => Hash::make('CorrectPassword123'),
        ]);

        $this->postJson('/api/auth/web/login', [
            'email' => $user->email,
            'password' => 'CorrectPassword123',
        ])
            ->assertUnauthorized()
            ->assertJsonMissingPath('code')
            ->assertJsonMissingPath('token');

        $user->forceFill(['email_verified_at' => now()])->save();
        $response = $this->postJson('/api/auth/web/login', [
            'email' => strtoupper($user->email),
            'password' => 'CorrectPassword123',
        ])
            ->assertOk()
            ->assertJsonPath('usuario.id', $user->id)
            ->assertJsonMissingPath('usuario.telefono')
            ->assertJsonMissingPath('usuario.password')
            ->assertJsonStructure(['token', 'expires_at']);

        $token = PersonalAccessToken::findToken($response->json('token'));
        $this->assertNotNull($token);
        $this->assertSame('aegis-web', $token->name);
        $this->assertTrue($token->expires_at->between(now()->addHours(7), now()->addHours(9)));
        $this->assertDatabaseHas('notificaciones', [
            'usuario_id' => $user->id,
            'titulo' => 'Inicio de sesión web',
        ]);

        $token->forceFill(['expires_at' => now()->subMinute()])->save();
        $this->withToken($response->json('token'))
            ->getJson('/api/auth/web/me')
            ->assertUnauthorized();
    }

    public function test_private_api_returns_json_401_without_accept_header(): void
    {
        $this->get('/api/auth/web/me')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_inactive_unverified_and_unknown_accounts_have_the_same_login_response(): void
    {
        $inactive = $this->createUser([
            'email' => 'inactive@example.com',
            'password' => Hash::make('CorrectPassword123'),
            'estado' => 'suspendido',
        ]);
        $unverified = $this->createUser([
            'email' => 'unverified@example.com',
            'password' => Hash::make('CorrectPassword123'),
        ]);

        $inactiveResponse = $this->postJson('/api/auth/web/login', [
            'email' => $inactive->email,
            'password' => 'CorrectPassword123',
        ])->assertUnauthorized();
        $unverifiedResponse = $this->postJson('/api/auth/web/login', [
            'email' => $unverified->email,
            'password' => 'CorrectPassword123',
        ])->assertUnauthorized();

        $unknownResponse = $this->postJson('/api/auth/web/login', [
            'email' => 'unknown@example.com',
            'password' => 'CorrectPassword123',
        ])->assertUnauthorized();

        $this->assertSame($inactiveResponse->json(), $unknownResponse->json());
        $this->assertSame($unverifiedResponse->json(), $unknownResponse->json());
    }

    public function test_only_unverified_web_tokens_are_blocked_from_writes(): void
    {
        $user = $this->createUser();
        $webToken = $user->createToken('aegis-web')->plainTextToken;
        $mobileToken = $user->createToken('aegis-movil')->plainTextToken;
        $payload = ['contenido' => 'Publicación de prueba'];

        $this->withToken($webToken)
            ->postJson('/api/foro', $payload)
            ->assertForbidden()
            ->assertJsonPath('code', 'EMAIL_VERIFICATION_REQUIRED');

        \Illuminate\Support\Facades\Auth::forgetGuards();
        $this->withToken($mobileToken)
            ->postJson('/api/foro', $payload)
            ->assertCreated();
    }

    public function test_password_recovery_is_non_enumerating_and_reset_revokes_tokens(): void
    {
        Notification::fake();
        $user = $this->createUser(['email' => 'reset@example.com']);
        $user->createToken('aegis-web');

        $known = $this->postJson('/api/auth/web/password/forgot', [
            'email' => $user->email,
        ])->assertAccepted();
        $unknown = $this->postJson('/api/auth/web/password/forgot', [
            'email' => 'missing@example.com',
        ])->assertAccepted();
        $this->assertSame($known->json(), $unknown->json());

        $resetToken = null;
        Notification::assertSentTo(
            $user,
            ResetPassword::class,
            function (ResetPassword $notification) use (&$resetToken): bool {
                $resetToken = $notification->token;

                return true;
            },
        );

        $this->postJson('/api/auth/web/password/reset', [
            'email' => $user->email,
            'token' => $resetToken,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])
            ->assertOk();

        $this->assertTrue(Hash::check('NewPassword123', $user->fresh()->password));
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_usuario_password_reset_tokens_are_isolated_from_scaffold_users(): void
    {
        $email = 'shared-email@example.com';
        User::factory()->create(['email' => $email]);
        $usuario = $this->createUser(['email' => $email]);

        \Illuminate\Support\Facades\Password::broker('usuarios')->createToken($usuario);

        $this->assertDatabaseHas('usuario_password_reset_tokens', ['email' => $email]);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $email]);
    }

    public function test_account_owner_can_list_revoke_and_close_all_sessions(): void
    {
        $user = $this->createVerifiedUser();
        $otherUser = $this->createVerifiedUser();
        $login = $this->postJson('/api/auth/web/login', [
            'email' => $user->email,
            'password' => 'CorrectPassword123',
        ])->assertOk();
        $currentToken = PersonalAccessToken::findToken($login->json('token'));
        $otherSession = $user->createToken('aegis-movil');
        $foreignSession = $otherUser->createToken('aegis-web');

        $sessions = $this->withToken($login->json('token'))
            ->getJson('/api/auth/web/sessions')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonMissingPath('data.0.token')
            ->json('data');
        $this->assertTrue(collect($sessions)->contains(
            fn (array $session): bool => $session['id'] === $currentToken->id && $session['current'],
        ));

        $this->deleteJson('/api/auth/web/sessions/'.$foreignSession->accessToken->id)
            ->assertNotFound();

        $this->deleteJson('/api/auth/web/sessions/'.$otherSession->accessToken->id)
            ->assertNoContent();
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $otherSession->accessToken->id]);

        $this->deleteJson('/api/auth/web/sessions')
            ->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);

        \Illuminate\Support\Facades\Auth::forgetGuards();
        $this->getJson('/api/auth/web/me')->assertUnauthorized();
    }

    public function test_password_change_checks_current_password_and_revokes_sessions(): void
    {
        $user = $this->createVerifiedUser();
        $token = $user->createToken('aegis-web')->plainTextToken;

        $this->withToken($token)->patchJson('/api/auth/web/password', [
            'current_password' => 'wrong-password',
            'password' => 'UpdatedPassword123',
            'password_confirmation' => 'UpdatedPassword123',
        ])->assertJsonValidationErrors(['current_password']);

        $this->patchJson('/api/auth/web/password', [
            'current_password' => 'CorrectPassword123',
            'password' => 'UpdatedPassword123',
            'password_confirmation' => 'UpdatedPassword123',
        ])->assertOk();

        $this->assertTrue(Hash::check('UpdatedPassword123', $user->fresh()->password));
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/web/login', [
                'email' => 'missing@example.com',
                'password' => 'WrongPassword123',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/auth/web/login', [
            'email' => 'missing@example.com',
            'password' => 'WrongPassword123',
        ])->assertTooManyRequests();
    }

    private function createUser(array $overrides = []): Usuario
    {
        $this->userNumber++;

        return Usuario::query()->create(array_merge([
            'nombre' => 'Test',
            'apellido' => 'User',
            'username' => 'web-user-'.$this->userNumber,
            'email' => 'web-user-'.$this->userNumber.'@example.com',
            'password' => Hash::make('CorrectPassword123'),
        ], $overrides));
    }

    private function createVerifiedUser(array $overrides = []): Usuario
    {
        return $this->createUser(array_merge([
            'email_verified_at' => now(),
        ], $overrides));
    }
}
