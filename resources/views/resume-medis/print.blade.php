<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Resume Medis Rawat Jalan</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12pt; margin: 30px; color: #222; background: #fff; }
        .resume-medis { max-width: 800px; margin: auto; background: #fff; }
        .header { text-align: center; margin-bottom: 10px; }
        .company { color: #1b7fc4; font-size: 20pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .plant { color: #888; font-size: 11pt; font-style: italic; margin-top: 2px; }
        .contact { color: #666; font-size: 10pt; margin-top: 2px; }
        .header-divider { border-bottom: 2px solid #1b7fc4; margin: 8px 0 12px 0; }
        .judul { color: #1b7fc4; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 18px 0 2px 0; letter-spacing: 1px; }
        .no-kunjungan { font-size: 11pt; font-weight: 600; margin-bottom: 12px; }
        .data-pasien-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .data-pasien-table td.data-pasien-label {
            font-weight: bold;
            color: #1976d2;
            width: 120px;
            padding-right: 4px;
            white-space: nowrap;
        }
        .data-pasien-table td.data-pasien-sep {
            width: 10px;
            text-align: right;
            padding-right: 4px;
        }
        .data-pasien-table td.data-pasien-value {
            width: 180px;
            padding-right: 16px;
            white-space: nowrap;
        }
        .section-title { color: #1b7fc4; border-bottom: 1px solid #1b7fc4; margin-top: 18px; margin-bottom: 6px; font-weight: bold; font-size: 12.5pt; letter-spacing: 0.5px; }
        .capitalize { text-transform: capitalize; }
        .diagnosa-list { margin: 0 0 10px 0; padding: 0; list-style: none; }
        .diagnosa-list li { margin-bottom: 2px; }
        .diagnosa-bullet { font-weight: bold; color: #1b7fc4; margin-right: 6px; }
        .obat-list { margin-bottom: 10px; padding-left: 0; }
        .obat-list li { margin-bottom: 2px; list-style: none; }
        .obat-bullet { font-weight: bold; color: #1b7fc4; margin-right: 6px; }
        .hasil-lab table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .hasil-lab th { background: #f5f5f5; color: #1b7fc4; font-weight: bold; border: 1px solid #bbb; text-align: center; }
        .hasil-lab td { border: 1px solid #bbb; color: #222; text-align: center; }
        .hasil-lab td.lab-name { text-align: left; }
        .footer { margin-top: 60px; }
        .dokter { float: right; text-align: center; margin-right: 30px; }
        .dokter-nama { font-weight: bold; border-top: 1.5px solid #444; margin-top: 40px; padding-top: 6px; letter-spacing: 1px; }
        @media print { .resume-medis { page-break-after: always; } }
        .obat-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .obat-table th, .obat-table td {
            padding: 4px 8px;
            text-align: left;
            border: none;
            font-size: 11pt;
        }
        .obat-table th {
            font-weight: bold;
            color: #1976d2;
            background: none;
            border-bottom: 1px solid #b0c4de;
        }
    </style>
    <script>
        window.onload = function() { window.print(); };
    </script>
</head>
<body>
<div class="resume-medis">
    <!-- Header Perusahaan/Plant -->
    <div class="header">
        <div class="company">{{ $queue->patientRecord->company->name ?? '-' }}</div>
        <div class="plant">{{ $queue->patientRecord->plant->name ?? '' }}</div>
        @php
            $alamat = $queue->patientRecord->plant->address ?? $queue->patientRecord->company->address ?? '-';
            $telp = $queue->patientRecord->plant->phone ?? $queue->patientRecord->company->phone ?? '-';
            $email = $queue->patientRecord->plant->email ?? $queue->patientRecord->company->email ?? '-';
        @endphp
        <div class="contact">Alamat: {{ $alamat }}</div>
        <div class="contact">Telp: {{ $telp }} | Email: {{ $email }}</div>
        <div class="header-divider"></div>
    </div>
    <div class="judul">RESUME MEDIS RAWAT JALAN</div>
    <div class="no-kunjungan">No. Kunjungan: {{ $queue->outpatient_visit_number ?? '-' }}</div>
    

    <!-- Data Pasien & Kunjungan (1 tabel, rata kiri, ':' sejajar) -->
    <table class="data-pasien-table">
        <tr><td class="data-pasien-label">NIK</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $queue->patientRecord->nik ?? '-' }}</td>
            <td class="data-pasien-label">No. RM</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $queue->patientRecord->medical_record_number ?? '-' }}</td></tr>
        <tr><td class="data-pasien-label">Nama pasien</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $queue->patientRecord->name ?? '-' }}</td>
            <td class="data-pasien-label">Waktu kunjungan</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $queue->created_at->format('d-m-Y H:i') }}</td></tr>
        <tr><td class="data-pasien-label">Tanggal lahir</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">
            @php
                $birthDate = $queue->patientRecord->birth_date ?? null;
                $birthDateFormatted = '-';
                if ($birthDate) {
                    try {
                        $birthDateFormatted = \Carbon\Carbon::parse($birthDate)->format('d-m-Y');
                    } catch (Exception $e) {
                        $birthDateFormatted = $birthDate;
                    }
                }
            @endphp
            {{ $birthDateFormatted }} ({{ $queue->patientRecord->age ?? '-' }} tahun)
        </td>
        <td class="data-pasien-label">Waktu di cetak</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ date('d-m-Y H:i') }}</td></tr>
        <tr><td class="data-pasien-label">Jenis kelamin</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $queue->patientRecord->gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
            <td class="data-pasien-label">Penjamin</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">
                @php
                    $guarantorName = '-';
                    if ($guarantorData && $guarantorData->guarantor) {
                        $guarantorName = $guarantorData->guarantor->name;
                    }
                @endphp
                {{ $guarantorName }}
            </td></tr>
        <tr><td class="data-pasien-label">Alamat</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $queue->patientRecord->address ?? '-' }}</td>
            <td class="data-pasien-label">No. Penjamin</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">
                @php
                    $guarantorNumber = '-';
                    if ($guarantorData) {
                        $guarantorNumber = $guarantorData->guarantor_number;
                    }
                @endphp
                {{ $guarantorNumber }}
            </td></tr>
    </table>
    <!-- Anamnesa & Pemeriksaan -->
    <div class="section-title">Anamnesa</div>
    <div class="capitalize">{{ ucfirst(strtolower($medicalRecord->chief_complaint ?? '-')) }}</div>
    <div class="section-title">Riwayat Penyakit</div>
    <div class="capitalize">{{ ucfirst(strtolower($queue->patientRecord->illness_history ?? '-')) }}</div>
    <div class="section-title">Pemeriksaan Fisik</div>
    <div class="capitalize">{{ ucfirst(strtolower($medicalRecord->phys_exam ?? '-')) }}</div>
    <!-- Diagnosa -->
    <div class="section-title">Diagnosa</div>
    <ul class="diagnosa-list">
        @foreach(($medicalRecord->diagnosisDetails ?? []) as $diag)
            <li><span class="diagnosa-bullet">&#8226;</span> <span style="font-weight:600;">{{ $diag->diagnosa->code ?? '-' }}</span> - {{ $diag->diagnosa->name ?? $diag->diagnosa_text ?? '-' }}</li>
        @endforeach
    </ul>
    <!-- Obat (bullet, nama, jumlah, satuan, instruksi) -->
    <div class="section-title">Obat</div>
    <table class="obat-table">
        <thead>
            <tr>
                <th>Nama Obat</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Instruksi</th>
            </tr>
        </thead>
        <tbody>
            @foreach(($medicalRecord->prescriptions[0]->prescriptionDetails ?? []) as $pres)
                <tr>
                    <td>{{ $pres->inventoryItem->name ?? '-' }}</td>
                    <td>{{ $pres->quantity ?? '-' }}</td>
                    <td>
                        @if(isset($pres->inventoryItem->unit) && is_object($pres->inventoryItem->unit))
                            {{ $pres->inventoryItem->unit->name ?? '-' }}
                        @else
                            {{ $pres->inventoryItem->unit ?? '-' }}
                        @endif
                    </td>
                    <td>{{ $pres->instruction ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <!-- Hasil Laboratorium -->
    <div class="section-title">Hasil Laboratorium</div>
    <div class="hasil-lab">
        <table>
            <tr>
                <th>Pemeriksaan</th><th>Hasil</th><th>Nilai Referensi</th><th>Satuan</th><th>Status</th>
            </tr>
            @foreach(($medicalRecord->labRequests ?? []) as $labReq)
                @php
                    $labDetail = $labReq->labDetails->first();
                    $labResult = $labDetail->labResult ?? null;
                    $labMaster = $labDetail->labMaster ?? null;
                    $labReference = null;
                    if (isset($labMaster->references) && count($labMaster->references)) {
                        $labReference = $labMaster->references->firstWhere('reference_type', $queue->patientRecord->gender)
                            ?? $labMaster->references->firstWhere('reference_type', 'universal')
                            ?? $labMaster->references->first();
                    }
                @endphp
                <tr>
                    <td class="lab-name">{{ $labMaster->name ?? '-' }}</td>
                    <td>{{ $labResult->result ?? '-' }}</td>
                    <td>{{ $labReference->reference ?? '-' }}</td>
                    <td>{{ isset($labMaster->unit) && is_object($labMaster->unit) ? $labMaster->unit->name : ($labMaster->unit ?? '-') }}</td>
                    <td>{{ $labResult->result_status ?? '-' }}</td>
                </tr>
            @endforeach
        </table>
    </div>
    <!-- Footer Dokter Pemeriksa -->
    <div class="footer">
        <div class="dokter">
            Dokter Pemeriksa<br/><br/><br/>
            <div class="dokter-nama">{{ $medicalRecord->examiner->name ?? '________________' }}</div>
        </div>
        <div style="clear:both"></div>
    </div>
</div>
</body>
</html> 