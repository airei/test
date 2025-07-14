<?php

use App\Helpers\CurrencyHelper;

if (!function_exists('format_currency')) {
    /**
     * Format currency ke format Indonesia
     * Contoh: format_currency(1000) -> "Rp 1.000,-"
     * 
     * @param float|int $amount
     * @param string $currency
     * @return string
     */
    function format_currency($amount, $currency = 'Rp')
    {
        return CurrencyHelper::format($amount, $currency);
    }
}

if (!function_exists('format_currency_without_symbol')) {
    /**
     * Format currency tanpa simbol mata uang
     * Contoh: format_currency_without_symbol(1000) -> "1.000,-"
     * 
     * @param float|int $amount
     * @return string
     */
    function format_currency_without_symbol($amount)
    {
        return CurrencyHelper::formatWithoutSymbol($amount);
    }
}

if (!function_exists('parse_currency')) {
    /**
     * Parse format currency Indonesia kembali ke angka
     * Contoh: parse_currency("Rp 1.000,-") -> 1000
     * 
     * @param string $formattedAmount
     * @return float
     */
    function parse_currency($formattedAmount)
    {
        return CurrencyHelper::parse($formattedAmount);
    }
}

if (!function_exists('user_can')) {
    /**
     * Check if the authenticated user has a specific permission.
     */
    function user_can($permission)
    {
        $user = auth()->user();
        return $user ? $user->hasPermission($permission) : false;
    }
}

if (!function_exists('user_has_module')) {
    /**
     * Check if the authenticated user has access to a specific module.
     */
    function user_has_module($module)
    {
        $user = auth()->user();
        return $user ? $user->hasModuleAccess($module) : false;
    }
}

if (!function_exists('is_super_admin')) {
    /**
     * Check if the authenticated user is a super admin.
     */
    function is_super_admin()
    {
        $user = auth()->user();
        return $user ? $user->isSuperAdmin() : false;
    }
}

if (!function_exists('get_user_permissions')) {
    /**
     * Get all permissions for the authenticated user.
     */
    function get_user_permissions()
    {
        $user = auth()->user();
        return $user ? $user->getAllPermissions() : collect();
    }
}

if (!function_exists('get_user_modules')) {
    /**
     * Get all modules the authenticated user has access to.
     */
    function get_user_modules()
    {
        $user = auth()->user();
        return $user ? $user->getAccessibleModules() : collect();
    }
} 