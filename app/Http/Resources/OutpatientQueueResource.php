<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class OutpatientQueueResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        Carbon::setLocale('id');

        $birthDate = Carbon::parse($this->patientRecord->birth_date);

        return [
            'id' => $this->id,
            'outpatient_visit_number' => $this->outpatient_visit_number,
            'status' => $this->status,
            'patient_record' => [
                'id' => $this->patientRecord->id,
                'medical_record_number' => $this->patientRecord->medical_record_number,
                'name' => $this->patientRecord->name,
                'nik' => $this->patientRecord->nik,
                'nip' => $this->patientRecord->nip,
                'gender' => $this->patientRecord->gender,
                'birth_date' => $this->patientRecord->birth_date ? $birthDate->translatedFormat('j F Y') : null,
                'age' => $this->patientRecord->birth_date ? $birthDate->age : null,
                'blood_type' => $this->patientRecord->blood_type,
                'blood_rhesus' => $this->patientRecord->blood_rhesus,
                'phone_number' => $this->patientRecord->phone_number,
                'address' => $this->patientRecord->address,
                'illness_history' => $this->patientRecord->illness_history,
                'allergy' => $this->patientRecord->allergy,
                'company_id' => $this->patientRecord->company_id,
                'plant_id' => $this->patientRecord->plant_id,
                'company' => $this->patientRecord->company,
                'plant' => $this->patientRecord->plant,
                'department' => $this->patientRecord->department,
            ],
        ];
    }
}
