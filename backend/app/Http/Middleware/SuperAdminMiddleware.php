<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && 
            (auth()->user()->role === 'superadmin' || 
             auth()->user()->role === 'admin')) {
            return $next($request);
        }

        return response()->json(['error' => 'Access denied. Super admin privileges required.'], 403);
    }
}
