<?php

namespace App\Policies;

use App\Models\LabMaster;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LabMasterPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Semua user yang login bisa melihat list laboratorium
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LabMaster $labMaster): bool
    {
        // Super admin bisa lihat semua
        if ($user->role && $user->role->name === 'super_admin') {
            return true;
        }

        // User biasa hanya bisa lihat data milik company/plant mereka
        return $labMaster->company_id === $user->company_id && 
               $labMaster->plant_id === $user->plant_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Semua user yang login bisa create laboratorium
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LabMaster $labMaster): bool
    {
        // Super admin bisa update semua
        if ($user->role && $user->role->name === 'super_admin') {
            return true;
        }

        // User biasa hanya bisa update data milik company/plant mereka
        return $labMaster->company_id === $user->company_id && 
               $labMaster->plant_id === $user->plant_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LabMaster $labMaster): bool
    {
        // Log untuk debugging
        \Log::info('Policy delete check:', [
            'user_id' => $user->id,
            'user_role' => $user->role ? $user->role->name : 'no_role',
            'lab_master_id' => $labMaster->id,
            'lab_company_id' => $labMaster->company_id,
            'lab_plant_id' => $labMaster->plant_id,
            'user_company_id' => $user->company_id,
            'user_plant_id' => $user->plant_id
        ]);

        // Super admin bisa delete semua
        if ($user->role && $user->role->name === 'super_admin') {
            \Log::info('Policy: Super admin access granted');
            return true;
        }

        // User biasa hanya bisa delete data milik company/plant mereka
        $hasAccess = $labMaster->company_id === $user->company_id && 
                    $labMaster->plant_id === $user->plant_id;
        
        \Log::info('Policy: Regular user access check', [
            'has_access' => $hasAccess,
            'company_match' => $labMaster->company_id === $user->company_id,
            'plant_match' => $labMaster->plant_id === $user->plant_id
        ]);

        return $hasAccess;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LabMaster $labMaster): bool
    {
        // Super admin bisa restore semua
        if ($user->role && $user->role->name === 'super_admin') {
            return true;
        }

        // User biasa hanya bisa restore data milik company/plant mereka
        return $labMaster->company_id === $user->company_id && 
               $labMaster->plant_id === $user->plant_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LabMaster $labMaster): bool
    {
        // Super admin bisa force delete semua
        if ($user->role && $user->role->name === 'super_admin') {
            return true;
        }

        // User biasa hanya bisa force delete data milik company/plant mereka
        return $labMaster->company_id === $user->company_id && 
               $labMaster->plant_id === $user->plant_id;
    }
}
