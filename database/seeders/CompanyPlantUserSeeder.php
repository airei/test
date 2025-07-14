<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Company;
use App\Models\Plant;
use App\Models\User;
use App\Models\Role;

class CompanyPlantUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if not exists
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $moderatorRole = Role::firstOrCreate(['name' => 'moderator']);

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

        // Create users
        // Salman - Dana Abadi Jakarta
        $salman = User::create([
            'name' => 'Salman',
            'email' => 'salman@danaabadi.com',
            'password' => Hash::make('password'),
            'company_id' => $danaAbadi->id,
            'plant_id' => $jakartaPlant->id,
            'email_verified_at' => now(),
        ]);
        $salman->roles()->attach($userRole->id);

        // Ayu - Insi Sejahtera Bekasi
        $ayu = User::create([
            'name' => 'Ayu',
            'email' => 'ayu@insisejahtera.com',
            'password' => Hash::make('password'),
            'company_id' => $insiSejahtera->id,
            'plant_id' => $bekasiPlant->id,
            'email_verified_at' => now(),
        ]);
        $ayu->roles()->attach($userRole->id);

        // Haroh - Dana Abadi Bandung (Moderator)
        $haroh = User::create([
            'name' => 'Haroh',
            'email' => 'haroh@danaabadi.com',
            'password' => Hash::make('password'),
            'company_id' => $danaAbadi->id,
            'plant_id' => $bandungPlant->id,
            'email_verified_at' => now(),
        ]);
        $haroh->roles()->attach($moderatorRole->id);

        $this->command->info('Companies, Plants, and Users seeded successfully!');
        $this->command->info('Companies created: PT. Dana Abadi, PT. Insi Sejahtera');
        $this->command->info('Plants created: Jakarta, Bandung, Bekasi');
        $this->command->info('Users created: Salman, Ayu, Haroh');
        $this->command->info('Roles created: admin, user, moderator');
        $this->command->info('User roles: Salman (user), Ayu (user), Haroh (moderator)');
        $this->command->info('All users password: password');
    }
} 