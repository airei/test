<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;
use App\Models\Department;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load helper functions
        require_once app_path('helpers.php');

        // Route model binding untuk Department
        $router = $this->app['router'];
        $router->bind('departemen', function ($value) {
            return Department::findOrFail($value);
        });
    }
}
