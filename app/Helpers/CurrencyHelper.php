<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format currency ke format Indonesia
     * Contoh: 1000 -> Rp 1.000,-
     * Contoh: 1000000 -> Rp 1.000.000,-
     * 
     * @param float|int $amount
     * @param string $currency
     * @return string
     */
    public static function format($amount, $currency = 'Rp')
    {
        // Pastikan amount adalah angka
        $amount = (float) $amount;
        
        // Format angka dengan pemisah ribuan
        $formatted = number_format($amount, 0, ',', '.');
        
        // Tambahkan simbol mata uang dan format Indonesia
        return $currency . ' ' . $formatted . ',-';
    }

    /**
     * Format currency tanpa simbol mata uang
     * Contoh: 1000 -> 1.000,-
     * 
     * @param float|int $amount
     * @return string
     */
    public static function formatWithoutSymbol($amount)
    {
        $amount = (float) $amount;
        $formatted = number_format($amount, 0, ',', '.');
        return $formatted . ',-';
    }

    /**
     * Format currency dengan simbol mata uang kustom
     * 
     * @param float|int $amount
     * @param string $currency
     * @return string
     */
    public static function formatCustom($amount, $currency = 'Rp')
    {
        $amount = (float) $amount;
        $formatted = number_format($amount, 0, ',', '.');
        return $currency . ' ' . $formatted . ',-';
    }

    /**
     * Parse format currency Indonesia kembali ke angka
     * Contoh: "Rp 1.000,-" -> 1000
     * 
     * @param string $formattedAmount
     * @return float
     */
    public static function parse($formattedAmount)
    {
        // Hapus simbol mata uang dan karakter non-digit kecuali titik dan koma
        $cleaned = preg_replace('/[^0-9.,]/', '', $formattedAmount);
        
        // Hapus koma di akhir (format Indonesia)
        $cleaned = rtrim($cleaned, ',');
        
        // Ganti koma dengan titik untuk decimal separator
        $cleaned = str_replace(',', '.', $cleaned);
        
        // Hapus titik sebagai thousand separator
        $parts = explode('.', $cleaned);
        if (count($parts) > 2) {
            // Ada multiple dots, berarti ada thousand separator
            $lastPart = array_pop($parts); // Ambil bagian terakhir sebagai decimal
            $thousandParts = implode('', $parts); // Gabungkan bagian thousand
            $cleaned = $thousandParts . '.' . $lastPart;
        }
        
        return (float) $cleaned;
    }
} 