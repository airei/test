import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Patient {
    id: number;
    medical_record_number: string;
    name: string;
    company?: { name: string };
    plant?: { name: string };
    department?: { name: string };
    employeeStatus?: { name: string };
    guarantors?: Array<{
        guarantor_number: string;
        guarantor: {
            name: string;
            number: string;
        };
    }>;
}

interface VitalSigns {
    systolic: string;
    diastolic: string;
    pulse: string;
    respiratory: string;
    temperature: string;
    oxygen_saturation: string;
}

interface NutritionStatus {
    height: string;
    weight: string;
    bmi: string;
    bmi_category: string;
}

interface Diagnosis {
    code: string;
    name: string;
    is_written: boolean;
}

interface Medication {
    name: string;
    quantity: string;
    unit: string;
    instruction: string;
}

interface LabExamination {
    name: string;
    result: string;
    unit: string;
    status: string;
}

interface MedicalHistoryItem {
    id: number;
    type: 'outpatient' | 'lab';
    visit_date: string;
    visit_number: string;
    examiner: string;
    shift: string;
    guarantor: string;
    chief_complaint: string;
    illness_history: string;
    vital_signs: VitalSigns;
    physical_exam: string;
    nutrition_status: NutritionStatus;
    diagnoses: Diagnosis[];
    medications: Medication[];
    lab_examinations: LabExamination[];
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string; label: string; active: boolean }>;
}

interface Props {
    patient: Patient;
    medicalHistory: MedicalHistoryItem[];
    pagination: Pagination;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pelayanan', href: '#' },
    { title: 'Registrasi & Rekam Medis', href: route('pelayanan.registrasi-rekam-medis.index') },
    { title: 'Riwayat Rekam Medis', href: '' },
];

export default function RiwayatRekamMedisShow({ patient, medicalHistory, pagination }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVisitTypeBadge = (type: string) => {
        if (type === 'outpatient') {
            return <Badge variant="default" className="bg-blue-100 text-blue-800">Rawat Jalan</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-100 text-green-800">Laboratorium</Badge>;
        }
    };

    function getGuarantorNumber(patient: Patient) {
        if (patient.guarantors && patient.guarantors.length > 0) {
            return patient.guarantors[0].guarantor_number || '-';
        }
        return '-';
    }
    function getEmployeeStatus(patient: Patient) {
        return patient.employeeStatus?.name || (patient as any).employee_status?.name || '-';
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Rekam Medis" />
            <div className="mt-6 space-y-6">
                {/* Header mirip detail inventory */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(route('pelayanan.registrasi-rekam-medis.index'))}
                        className="h-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Riwayat Rekam Medis</h1>
                        <p className="text-muted-foreground">Data riwayat kunjungan pasien</p>
                    </div>
                </div>

                {/* Patient Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Informasi Pasien</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">No. Rekam Medis</label>
                                <p className="text-sm text-gray-900">{patient.medical_record_number}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nama Pasien</label>
                                <p className="text-sm text-gray-900">{patient.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Perusahaan</label>
                                <p className="text-sm text-gray-900">{patient.company?.name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Plant</label>
                                <p className="text-sm text-gray-900">{patient.plant?.name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Departemen</label>
                                <p className="text-sm text-gray-900">{patient.department?.name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status Karyawan</label>
                                <p className="text-sm text-gray-900">{getEmployeeStatus(patient)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Penjamin</label>
                                <p className="text-sm text-gray-900">
                                    {(() => {
                                        if (patient.guarantors && patient.guarantors.length > 0) {
                                            const guarantor = patient.guarantors[0];
                                            if (guarantor.guarantor) {
                                                return guarantor.guarantor.name;
                                            }
                                        }
                                        return '-';
                                    })()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">No. Penjamin</label>
                                <p className="text-sm text-gray-900">{getGuarantorNumber(patient)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Riwayat Kunjungan</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {medicalHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Belum ada riwayat kunjungan</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No.
                                            </th>
                                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Data Kunjungan
                                            </th>
                                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subjektif
                                            </th>
                                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Objektif
                                            </th>
                                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Asesmen
                                            </th>
                                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Penatalaksanaan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {medicalHistory.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                    {(pagination.current_page - 1) * pagination.per_page + index + 1}
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            {getVisitTypeBadge(item.type)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.visit_number}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            <div>Waktu: {formatDate(item.visit_date)}</div>
                                                            <div>Penjamin: {item.guarantor}</div>
                                                            <div>Shift: {item.shift}</div>
                                                            <div>Pemeriksa: <span className="font-bold">{item.examiner}</span></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                    <div className="space-y-1">
                                                        <div>
                                                            <span className="font-medium">Chief Complaint:</span>
                                                            <div className="text-xs">{item.chief_complaint}</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Riwayat Penyakit:</span>
                                                            <div className="text-xs">{item.illness_history}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                    <div className="space-y-3">
                                                        {/* Pemeriksaan TTV */}
                                                        <div>
                                                            <div className="font-bold text-xs mb-1">Pemeriksaan TTV:</div>
                                                            <div className="space-y-1 text-xs">
                                                                <div>TD: {item.vital_signs.systolic}/{item.vital_signs.diastolic} mmHg</div>
                                                                <div>Nadi: {item.vital_signs.pulse} x/menit</div>
                                                                <div>Nafas: {item.vital_signs.respiratory} x/menit</div>
                                                                <div>Suhu: {item.vital_signs.temperature} °C</div>
                                                                <div>SpO2: {item.vital_signs.oxygen_saturation} %</div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Pemeriksaan Fisik */}
                                                        <div>
                                                            <div className="font-bold text-xs mb-1">Pemeriksaan Fisik:</div>
                                                            <div className="text-xs text-gray-500">{item.physical_exam}</div>
                                                        </div>
                                                        
                                                        {/* Status Gizi */}
                                                        <div>
                                                            <div className="font-bold text-xs mb-1">Status Gizi:</div>
                                                            <div className="space-y-1 text-xs">
                                                                <div>TB: {item.nutrition_status.height} cm</div>
                                                                <div>BB: {item.nutrition_status.weight} kg</div>
                                                                <div>BMI: {item.nutrition_status.bmi} ({item.nutrition_status.bmi_category})</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                    <div className="space-y-1">
                                                        {item.diagnoses.length > 0 ? (
                                                            item.diagnoses.map((diagnosis, idx) => (
                                                                <div key={idx} className="text-xs">
                                                                    <div className="font-medium">
                                                                        {diagnosis.code} - {diagnosis.name}
                                                                        {diagnosis.is_written && <span className="text-blue-600"> (Tertulis)</span>}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-500">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                    <div className="space-y-2">
                                                        {/* Medications */}
                                                        {item.medications.length > 0 && (
                                                            <div>
                                                                <div className="font-medium text-xs">Obat:</div>
                                                                {item.medications.map((med, idx) => (
                                                                    <div key={idx} className="text-xs ml-2">
                                                                        • {med.name} - {med.instruction !== '-' ? med.instruction : 'Tidak ada instruksi'} - {med.quantity} {med.unit}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Lab Examinations */}
                                                        {item.lab_examinations.length > 0 && (
                                                            <div>
                                                                <div className="font-medium text-xs">Pemeriksaan Lab:</div>
                                                                {item.lab_examinations.map((lab, idx) => (
                                                                    <div key={idx} className="text-xs ml-2">
                                                                        • {lab.name}
                                                                        {lab.result !== '-' && (
                                                                            <div className="ml-2 text-gray-600">
                                                                                Hasil: {lab.result} {lab.unit}
                                                                            </div>
                                                                        )}
                                                                        {lab.status !== '-' && (
                                                                            <div className="ml-2 text-gray-600">
                                                                                Status: {lab.status}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {item.medications.length === 0 && item.lab_examinations.length === 0 && (
                                                            <span className="text-xs text-gray-500">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-gray-500">
                                    Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
                                </p>
                                <div className="flex gap-2">
                                    {pagination.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-2 text-sm rounded ${
                                                link.active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}