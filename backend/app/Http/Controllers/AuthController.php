<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'user', // всегда user при регистрации
        ], [
            'email.unique' => 'Этот email уже зарегистрирован.',
        ]);

        // Check if this is the special admin user
        $isAdmin = ($data['name'] === 'Zubokryl777' && $data['password'] === 'ArikMarik888');
        
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $isAdmin ? 'admin' : ($data['role'] ?? 'user'),
        ]);

        // For Sanctum API authentication, create a token instead of using sessions
        $token = $user->createToken('auth_token')->plainTextToken;

        if (method_exists($user, 'sendEmailVerificationNotification')) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'Registered',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        // Log the incoming request data for debugging
        \Log::info('Login attempt', ['request_data' => $request->all()]);
        
        $fields = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ], [
            'email.required' => 'Email обязателен для заполнения.',
            'email.email' => 'Введите корректный email адрес.',
            'password.required' => 'Пароль обязателен для заполнения.',
            'password.string' => 'Пароль должен быть строкой.',
        ]);

        \Log::info('Validation passed', ['validated_fields' => $fields]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user) {
            \Log::warning('User not found', ['email' => $fields['email']]);
            throw ValidationException::withMessages(['email' => ['Пользователь с таким email не найден.']]);
        }

        if (!Hash::check($fields['password'], $user->password)) {
            \Log::warning('Invalid password', ['email' => $fields['email']]);
            throw ValidationException::withMessages(['email' => ['Неверный email или пароль.']]);
        }

        // Check if this is the special admin user and update role if needed
        if ($user->name === 'Zubokryl777' && $fields['password'] === 'ArikMarik888' && $user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }

        // Create Sanctum token for API authentication
        $token = $user->createToken('auth_token')->plainTextToken;

        \Log::info('Login successful', ['user_id' => $user->id, 'user_email' => $user->email]);

        return response()->json([
            'message' => 'Logged in',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }

    public function emailVerify($user_id, Request $request)
    {
        if (! $request->hasValidSignature()) {
            return response()->json(['message' => 'Invalid/expired verification'], 400);
        }

        $user = User::findOrFail($user_id);
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
            return response()->json(['message' => 'Email verified', 'user' => $user]);
        }

        return response()->json(['message' => 'Already verified'], 400);
    }

    public function resendEmailVerificationMail(Request $request)
    {
        $request->validate(['user_id' => 'required|integer|exists:users,id']);
        $user = User::findOrFail($request->input('user_id'));
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified'], 400);
        }
        
        // Check if the method exists before calling it
        if (method_exists($user, 'sendEmailVerificationNotification')) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json(['message' => 'Verification sent']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $status = Password::sendResetLink($request->only('email'));
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => trans($status)])
            : response()->json(['message' => trans($status)], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate(['token' => 'required','email' => 'required|email','password' => 'required|min:8|confirmed']);
        $status = Password::reset(
            $request->only('email','password','password_confirmation','token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password),'remember_token' => Str::random(60)])->save();
                event(new PasswordReset($user));
            }
        );
        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => trans($status)])
            : response()->json(['message' => trans($status)], 400);
    }
}