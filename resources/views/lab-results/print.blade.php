<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Hasil Pemeriksaan Laboratorium</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12pt; margin: 30px; color: #222; background: #fff; }
        .lab-results { max-width: 800px; margin: auto; background: #fff; }
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
        .hasil-lab table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .hasil-lab th { background: #f5f5f5; color: #1b7fc4; font-weight: bold; border: 1px solid #bbb; text-align: center; padding: 4px; }
        .hasil-lab td { border: 1px solid #bbb; color: #222; text-align: center; padding: 4px; }
        .hasil-lab td.lab-name { text-align: left; }
        .footer { margin-top: 60px; }
        .dokter { float: right; text-align: center; margin-right: 30px; }
        .dokter-nama { font-weight: bold; border-top: 1.5px solid #444; margin-top: 40px; padding-top: 6px; letter-spacing: 1px; }
        @media print { .lab-results { page-break-after: always; } }
    </style>
    <script>
        window.onload = function() { window.print(); };
    </script>
</head>
<body>
<div class="lab-results">
    <!-- Header Perusahaan/Plant -->
    <div class="header">
        <div class="company">{{ $labQueue->patientRecord->company->name ?? $labQueue->patientRecord->plant->name ?? 'MEDICAL CENTER' }}</div>
        @if($labQueue->patientRecord->plant && $labQueue->patientRecord->plant->name != $labQueue->patientRecord->company->name)
            <div class="plant">{{ $labQueue->patientRecord->plant->name }}</div>
        @endif
        @php
            $alamat = $labQueue->patientRecord->plant->address ?? $labQueue->patientRecord->company->address ?? '-';
            $telp = $labQueue->patientRecord->plant->phone ?? $labQueue->patientRecord->company->phone ?? '-';
            $email = $labQueue->patientRecord->plant->email ?? $labQueue->patientRecord->company->email ?? '-';
        @endphp
        <div class="contact">Alamat: {{ $alamat }}</div>
        <div class="contact">Telp: {{ $telp }} | Email: {{ $email }}</div>
        <div class="header-divider"></div>
    </div>
    <div class="judul">HASIL PEMERIKSAAN LABORATORIUM</div>
    <div class="no-kunjungan">No. Kunjungan: {{ $labQueue->lab_visit_number ?? '-' }}</div>
    
    <!-- Data Pasien & Kunjungan (1 tabel, rata kiri, ':' sejajar) -->
    <table class="data-pasien-table">
        <tr><td class="data-pasien-label">NIK</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->patientRecord->nik ?? '-' }}</td>
            <td class="data-pasien-label">No. RM</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->patientRecord->medical_record_number ?? '-' }}</td></tr>
        <tr><td class="data-pasien-label">Nama pasien</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->patientRecord->name ?? '-' }}</td>
            <td class="data-pasien-label">Waktu kunjungan</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->created_at->format('d-m-Y H:i') }}</td></tr>
        <tr><td class="data-pasien-label">Tanggal lahir</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">
            @php
                $birthDate = $labQueue->patientRecord->birth_date ?? null;
                $birthDateFormatted = '-';
                if ($birthDate) {
                    try {
                        $birthDateFormatted = \Carbon\Carbon::parse($birthDate)->format('d-m-Y');
                    } catch (Exception $e) {
                        $birthDateFormatted = $birthDate;
                    }
                }
            @endphp
            {{ $birthDateFormatted }} ({{ $labQueue->patientRecord->age ?? '-' }} tahun)
        </td>
        <td class="data-pasien-label">Waktu di cetak</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ date('d-m-Y H:i') }}</td></tr>
        <tr><td class="data-pasien-label">Jenis kelamin</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->patientRecord->gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
            <td class="data-pasien-label">Penjamin</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->labExamDetail->guarantor->name ?? '-' }}</td></tr>
        <tr><td class="data-pasien-label">Alamat</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">{{ $labQueue->patientRecord->address ?? '-' }}</td>
            <td class="data-pasien-label">No. Penjamin</td><td class="data-pasien-sep">:</td><td class="data-pasien-value">
                @php
                    $patientToGuarantor = $labQueue->patientRecord->guarantors->where('guarantors_id', $labQueue->labExamDetail->guarantor_id)->first();
                    $guarantorNumber = $patientToGuarantor ? $patientToGuarantor->guarantor_number : '-';
                @endphp
                {{ $guarantorNumber }}
            </td></tr>
    </table>

    <!-- Hasil Pemeriksaan Laboratorium -->
    <div class="section-title">Hasil Pemeriksaan Laboratorium</div>
    <div class="hasil-lab">
        @if(!$labQueue->labRequest || $labQueue->labRequest->labDetails->count() === 0)
            <div style="text-align: center; padding: 20px; color: #666;">
                Belum ada hasil pemeriksaan
            </div>
        @else
            <table>
                <thead>
                    <tr>
                        <th>Pemeriksaan</th>
                        <th>Hasil</th>
                        <th>Satuan</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($labQueue->labRequest->labDetails as $detail)
                        @php
                            $labMaster = $detail->labMaster;
                            $labResult = $detail->labResult;
                            $statusClass = $labResult && $labResult->result_status === 'abnormal' ? 'color: #dc2626; font-weight: bold;' : 'color: #059669; font-weight: bold;';
                        @endphp
                        <tr>
                            <td class="lab-name">{{ $labMaster->name ?? '-' }}</td>
                            <td style="{{ $statusClass }}">{{ $labResult->result ?? '-' }}</td>
                            <td>{{ $labMaster->unit ?? '-' }}</td>
                            <td>{{ $labResult && $labResult->result_status === 'abnormal' ? 'Abnormal' : 'Normal' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    <!-- Footer Dokter Pemeriksa -->
    <div class="footer">
        <div class="dokter">
            Dokter Pemeriksa<br/><br/><br/>
            <div class="dokter-nama">{{ $labQueue->labExamDetail->examiner->name ?? '________________' }}</div>
        </div>
        <div style="clear:both"></div>
    </div>

    <!-- Keterangan Flag -->
    <div style="margin-top: 20px; font-size: 10pt; color: #666;">
        <p><strong>Keterangan:</strong></p>
        <p>Abnormal = Nilai di luar batas normal, Normal = Nilai dalam batas normal</p>
    </div>
</div>
</body>
</html> 