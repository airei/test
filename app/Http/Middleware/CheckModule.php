<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModule
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = auth()->user();
        \Log::info('DEBUG: CheckModule called', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'module' => $module,
            'modules_user' => $user ? $user->getAccessibleModules()->toArray() : [],
            'role' => $user?->role?->name,
            'permissions' => $user ? $user->getAllPermissions()->pluck('name')->toArray() : [],
        ]);

        if (!$user) {
            \Log::info('DEBUG: CheckModule - User not authenticated');
            abort(401, 'Unauthorized');
        }

        // Super admin bypass semua module
        if ($user->role && $user->role->name === 'super_admin') {
            \Log::info('DEBUG: CheckModule - Super admin bypass');
            return $next($request);
        }

        // Cek apakah user punya akses ke module yang diperlukan
        if (!$user->hasModuleAccess($module)) {
            \Log::info('DEBUG: CheckModule - Access denied', [
                'modules_user' => $user->getAccessibleModules()->toArray(),
                'requested_module' => $module,
                'user_role' => $user->role?->name,
            ]);
            abort(403, 'Access denied. You do not have access to this module.');
        }

        return $next($request);
    }
} 