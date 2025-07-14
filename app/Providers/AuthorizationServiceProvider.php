<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Share authorization data to all Inertia pages
        Inertia::share('auth', function (Request $request) {
            \Log::info('DEBUG: Share Auth Called', [
                'user_id' => $request->user()?->id,
                'user_email' => $request->user()?->email,
            ]);
            $user = $request->user();
            if ($user) {
                $user->loadMissing('role.permissions');
            }

            if (!$user) {
                \Log::info('DEBUG: Share Auth - User not found');
                return [
                    'user' => null,
                    'permissions' => [],
                    'modules' => [],
                    'isSuperAdmin' => false,
                ];
            }

            \Log::info('DEBUG: Share Auth - User found', [
                'user_id' => $user->id,
                'modules' => $user->getAccessibleModules()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'role' => $user->role ? $user->role->name : null,
                'company' => $user->company ? $user->company->name : null,
                'plant' => $user->plant ? $user->plant->name : null,
            ]);

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                        'display_name' => $user->role->display_name,
                    ] : null,
                    'company' => $user->company ? [
                        'id' => $user->company->id,
                        'name' => $user->company->name,
                    ] : null,
                    'plant' => $user->plant ? [
                        'id' => $user->plant->id,
                        'name' => $user->plant->name,
                    ] : null,
                ],
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'modules' => $user->getAccessibleModules()->toArray(),
                'isSuperAdmin' => $user->isSuperAdmin(),
            ];
        });
    }
} 