<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // Debug logging
        Log::info('RoleMiddleware check', [
            'user' => $user ? $user->toArray() : null,
            'required_roles' => $roles,
            'route' => $request->path()
        ]);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Access denied. Required role: ' . implode(', ', $roles),
                'user_role' => $user->role
            ], 403);
        }

        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return void
     */
    public function terminate($request, $response)
    {
        // Log termination
        Log::info('Role middleware termination', [
            'route' => $request->path()
        ]);
    }
}