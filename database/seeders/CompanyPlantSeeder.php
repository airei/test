<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Plant;

class CompanyPlantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        // Create PT. Dana Abadi
        $danaAbadi = Company::create([
            'code' => '001',
            'name' => 'PT. Dana Abadi',
            'address' => 'Jl. Sudirman No. 123, Jakarta Pusat',
            'phone' => '021-5550123',
            'email' => 'info@danaabadi.com',
            'is_active' => true,
        ]);

        // Create plants for PT. Dana Abadi
        $jakartaPlant = Plant::create([
            'company_id' => $danaAbadi->id,
            'code' => '001',
            'name' => 'Jakarta',
            'address' => 'Jl. Thamrin No. 45, Jakarta Pusat',
            'phone' => '021-5550456',
            'email' => 'jakarta@danaabadi.com',
            'is_active' => true,
        ]);

        $bandungPlant = Plant::create([
            'company_id' => $danaAbadi->id,
            'code' => '002',
            'name' => 'Bandung',
            'address' => 'Jl. Asia Afrika No. 67, Bandung',
            'phone' => '022-5550789',
            'email' => 'bandung@danaabadi.com',
            'is_active' => true,
        ]);

        // Create PT. Insi Sejahtera
        $insiSejahtera = Company::create([
            'code' => '002',
            'name' => 'PT. Insi Sejahtera',
            'address' => 'Jl. Gatot Subroto No. 89, Jakarta Selatan',
            'phone' => '021-5550321',
            'email' => 'info@insisejahtera.com',
            'is_active' => true,
        ]);

        // Create plant for PT. Insi Sejahtera
        $bekasiPlant = Plant::create([
            'company_id' => $insiSejahtera->id,
            'code' => '001',
            'name' => 'Bekasi',
            'address' => 'Jl. Ahmad Yani No. 12, Bekasi',
            'phone' => '021-5550654',
            'email' => 'bekasi@insisejahtera.com',
            'is_active' => true,
        ]);

        $this->command->info('Companies and Plants seeded successfully!');
        $this->command->info('Companies created: PT. Dana Abadi, PT. Insi Sejahtera');
        $this->command->info('Plants created: Jakarta, Bandung, Bekasi');
    }
} 