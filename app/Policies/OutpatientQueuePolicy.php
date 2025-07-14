<?php

namespace App\Policies;

use App\Models\OutpatientQueue;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OutpatientQueuePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OutpatientQueue $outpatientQueue): bool
    {
        if ($user->role->name === 'super_admin') {
            return true;
        }

        return $user->company_id === $outpatientQueue->patientRecord->company_id
            && $user->plant_id === $outpatientQueue->patientRecord->plant_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OutpatientQueue $outpatientQueue): bool
    {
        if ($user->role->name === 'super_admin') {
            return true;
        }

        return $user->company_id === $outpatientQueue->patientRecord->company_id
            && $user->plant_id === $outpatientQueue->patientRecord->plant_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OutpatientQueue $outpatientQueue): bool
    {
        return false; // Generally, we don't delete queue records
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, OutpatientQueue $outpatientQueue): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, OutpatientQueue $outpatientQueue): bool
    {
        return false;
    }
}
