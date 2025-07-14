<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call UserSeeder
        $this->call([
            MedicareSeeder::class,
        ]);

        // Uncomment line below if you want to create additional random users
        // User::factory(10)->create();
    }
}
