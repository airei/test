<?php

namespace Tests\Feature;

use App\Models\LabMaster;
use App\Models\User;
use App\Models\Role;
use App\Models\Company;
use App\Models\Plant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaboratoriumPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        $superAdminRole = Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Admin',
            'description' => 'Super Administrator',
            'is_active' => true,
        ]);
        
        $userRole = Role::create([
            'name' => 'user',
            'display_name' => 'User',
            'description' => 'Regular User',
            'is_active' => true,
        ]);

        // Create companies
        $company1 = Company::create([
            'name' => 'Company 1',
            'is_active' => true,
        ]);
        
        $company2 = Company::create([
            'name' => 'Company 2',
            'is_active' => true,
        ]);

        // Create plants
        $plant1 = Plant::create([
            'company_id' => $company1->id,
            'name' => 'Plant 1',
            'is_active' => true,
        ]);
        
        $plant2 = Plant::create([
            'company_id' => $company2->id,
            'name' => 'Plant 2',
            'is_active' => true,
        ]);

        // Create users
        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $superAdminRole->id,
            'company_id' => $company1->id,
            'plant_id' => $plant1->id,
            'is_active' => true,
        ]);

        $this->regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'user@test.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'company_id' => $company1->id,
            'plant_id' => $plant1->id,
            'is_active' => true,
        ]);

        $this->otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@test.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'company_id' => $company2->id,
            'plant_id' => $plant2->id,
            'is_active' => true,
        ]);

        // Create lab masters
        $this->labMaster1 = LabMaster::create([
            'company_id' => $company1->id,
            'plant_id' => $plant1->id,
            'name' => 'Test Lab 1',
            'unit' => 'mg/dL',
            'price' => 100000,
            'is_active' => true,
        ]);

        $this->labMaster2 = LabMaster::create([
            'company_id' => $company2->id,
            'plant_id' => $plant2->id,
            'name' => 'Test Lab 2',
            'unit' => 'mg/dL',
            'price' => 150000,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function super_admin_can_view_any_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->get('/manajemen/laboratorium');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Manajemen/Laboratorium/Index')
        );
    }

    /** @test */
    public function regular_user_can_view_any_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->get('/manajemen/laboratorium');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Manajemen/Laboratorium/Index')
        );
    }

    /** @test */
    public function super_admin_can_view_own_company_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->get("/manajemen/laboratorium/{$this->labMaster1->id}/edit");
        
        $response->assertStatus(200);
    }

    /** @test */
    public function super_admin_can_view_other_company_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->get("/manajemen/laboratorium/{$this->labMaster2->id}/edit");
        
        $response->assertStatus(200);
    }

    /** @test */
    public function regular_user_can_view_own_company_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->get("/manajemen/laboratorium/{$this->labMaster1->id}/edit");

        $response->assertStatus(200);
    }

    /** @test */
    public function regular_user_cannot_view_other_company_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->get("/manajemen/laboratorium/{$this->labMaster2->id}/edit");
        
        $response->assertStatus(403);
    }

    /** @test */
    public function super_admin_can_delete_own_company_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->delete("/manajemen/laboratorium/{$this->labMaster1->id}");
        
        $response->assertRedirect('/manajemen/laboratorium');
        $this->assertDatabaseMissing('lab_masters', ['id' => $this->labMaster1->id]);
    }

    /** @test */
    public function super_admin_can_delete_other_company_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->delete("/manajemen/laboratorium/{$this->labMaster2->id}");
        
        $response->assertRedirect('/manajemen/laboratorium');
        $this->assertDatabaseMissing('lab_masters', ['id' => $this->labMaster2->id]);
    }

    /** @test */
    public function regular_user_can_delete_own_company_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->delete("/manajemen/laboratorium/{$this->labMaster1->id}");
        
        $response->assertRedirect('/manajemen/laboratorium');
        $this->assertDatabaseMissing('lab_masters', ['id' => $this->labMaster1->id]);
    }

    /** @test */
    public function regular_user_cannot_delete_other_company_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->delete("/manajemen/laboratorium/{$this->labMaster2->id}");
        
        $response->assertStatus(403);
        $this->assertDatabaseHas('lab_masters', ['id' => $this->labMaster2->id]);
    }

    /** @test */
    public function super_admin_can_update_own_company_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->put("/manajemen/laboratorium/{$this->labMaster1->id}", [
            'name' => 'Updated Lab 1',
            'unit' => 'mg/dL',
            'price' => 120000,
            'references' => [
                ['type' => 'universal', 'reference' => '10-20']
            ]
        ]);
        
        $response->assertRedirect('/manajemen/laboratorium');
        $this->assertDatabaseHas('lab_masters', [
            'id' => $this->labMaster1->id,
            'name' => 'Updated Lab 1'
        ]);
    }

    /** @test */
    public function super_admin_can_update_other_company_laboratorium()
    {
        $this->actingAs($this->superAdmin);
        
        $response = $this->put("/manajemen/laboratorium/{$this->labMaster2->id}", [
            'name' => 'Updated Lab 2',
            'unit' => 'mg/dL',
            'price' => 180000,
            'references' => [
                ['type' => 'universal', 'reference' => '15-25']
            ]
        ]);
        
        $response->assertRedirect('/manajemen/laboratorium');
        $this->assertDatabaseHas('lab_masters', [
            'id' => $this->labMaster2->id,
            'name' => 'Updated Lab 2'
        ]);
    }

    /** @test */
    public function regular_user_can_update_own_company_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->put("/manajemen/laboratorium/{$this->labMaster1->id}", [
            'name' => 'Updated Lab 1',
            'unit' => 'mg/dL',
            'price' => 120000,
            'references' => [
                ['type' => 'universal', 'reference' => '10-20']
            ]
        ]);
        
        $response->assertRedirect('/manajemen/laboratorium');
        $this->assertDatabaseHas('lab_masters', [
            'id' => $this->labMaster1->id,
            'name' => 'Updated Lab 1'
        ]);
    }

    /** @test */
    public function regular_user_cannot_update_other_company_laboratorium()
    {
        $this->actingAs($this->regularUser);
        
        $response = $this->put("/manajemen/laboratorium/{$this->labMaster2->id}", [
            'name' => 'Updated Lab 2',
            'unit' => 'mg/dL',
            'price' => 180000,
            'references' => [
                ['type' => 'universal', 'reference' => '15-25']
            ]
        ]);
        
        $response->assertStatus(403);
        $this->assertDatabaseHas('lab_masters', [
            'id' => $this->labMaster2->id,
            'name' => 'Test Lab 2'
        ]);
    }
}
