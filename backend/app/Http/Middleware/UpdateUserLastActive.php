<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UpdateUserLastActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Update the user's last active timestamp if they're authenticated
        if (Auth::check()) {
            $user = Auth::user();
            
            // Only update if the last update was more than 5 minutes ago
            // to avoid excessive database writes
            if (!$user->last_active || $user->last_active->diffInMinutes(Carbon::now()) >= 5) {
                $user->update(['last_active' => Carbon::now()]);
            }
        }

        return $next($request);
    }
}