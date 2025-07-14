import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Stethoscope, XCircle, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Pelayanan', href: '#' },
  { title: 'Pemeriksaan Lab', href: '' },
];

const STATUS = [
  { value: 'belum diperiksa', label: 'Belum Diperiksa', color: 'bg-blue-100 text-blue-700' },
  { value: 'sedang diperiksa', label: 'Sedang Diperiksa', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-700' },
  { value: 'batal', label: 'Batal', color: 'bg-red-100 text-red-700' },
];

interface LabQueue {
  id: string;
  waktu: string;
  nik: string;
  nip: string;
  nama: string;
  rm: string;
  lahir: string;
  umur: number;
  gender: string;
  departemen: string;
  status_karyawan: string;
  status: string;
  lab_visit_number: string;
  patient_record_id: string;
}

interface Props {
  labQueues: {
    data: LabQueue[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
  };
  filters: {
    search?: string;
    status?: string;
    tanggal?: string;
  };
  stats: {
    total_hari_ini: number;
    total_bulan_ini: number;
    belum_diperiksa_bulan_ini: number;
    batal_bulan_ini: number;
    selesai_bulan_ini: number;
  };
}

// Ambil tanggal hari ini dari waktu lokal user (browser)
const todayStr = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})();

const timezoneOffset = new Date().getTimezoneOffset();

export default function PemeriksaanLab({ labQueues, filters, stats }: Props) {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    status: filters.status || 'all',
    tanggal: filters.tanggal || todayStr,
  });

  // Tahap 1: Set tanggal lokal jika filters.tanggal kosong
  useEffect(() => {
    if (!filters.tanggal) {
      setLocalFilters((prev) => ({ ...prev, tanggal: todayStr }));
    }
    // eslint-disable-next-line
  }, []);

  // Tahap 2: Setelah localFilters.tanggal update, trigger router.get
  useEffect(() => {
    if (!filters.tanggal && localFilters.tanggal === todayStr) {
      router.get(route('pelayanan.pemeriksaan-lab.index'), { ...localFilters, tanggal: todayStr, timezone_offset: timezoneOffset }, { preserveState: true, replace: true });
    }
    // eslint-disable-next-line
  }, [localFilters.tanggal]);

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    // Untuk status, kirim string kosong jika value adalah "all"
    const filterValue = field === 'status' && value === 'all' ? '' : value;
    const backendFilters = { ...newFilters, [field]: filterValue, timezone_offset: timezoneOffset };
    
    // Debounce search
    if (field === 'search') {
      clearTimeout((window as any).searchTimeout);
      (window as any).searchTimeout = setTimeout(() => {
        router.get(route('pelayanan.pemeriksaan-lab.index'), backendFilters, {
          preserveState: true,
          replace: true,
        });
      }, 300);
    } else {
      router.get(route('pelayanan.pemeriksaan-lab.index'), backendFilters, {
        preserveState: true,
        replace: true,
      });
    }
  };

  const handleStatusUpdate = (queueId: string, newStatus: string, redirectTo?: string) => {
    router.patch(route('pelayanan.pemeriksaan-lab.update-status', queueId), {
      status: newStatus
    }, {
      onSuccess: () => {
        if (redirectTo) {
          router.visit(redirectTo);
        } else {
          router.visit(window.location.href);
        }
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Pemeriksaan Laboratorium</h1>
        </div>
        {/* Statistik Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-700">{stats?.total_hari_ini ?? 0}</div>
            <div className="text-sm text-blue-800 mt-1 text-center">Pasien Hari Ini</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">{stats?.total_bulan_ini ?? 0}</div>
            <div className="text-sm text-green-800 mt-1 text-center">Pasien Bulan Ini</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-700">{stats?.belum_diperiksa_bulan_ini ?? 0}</div>
            <div className="text-sm text-yellow-800 mt-1 text-center">Belum Diperiksa</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-700">{stats?.batal_bulan_ini ?? 0}</div>
            <div className="text-sm text-red-800 mt-1 text-center">Batal</div>
          </div>
          <div className="bg-green-100 border border-green-400 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-900">{stats?.selesai_bulan_ini ?? 0}</div>
            <div className="text-sm text-green-900 mt-1 text-center">Selesai</div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={(e) => { e.preventDefault(); router.get(route('pelayanan.pemeriksaan-lab.index'), { search: localFilters.search, status: localFilters.status, tanggal: localFilters.tanggal }, { preserveState: true }); }} className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari nama, NIK, NIP..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                <Search className="w-4 h-4 mr-2" />
                Cari
              </Button>
              <div className="flex gap-4">
                <div>
                  <Label className="text-sm">Status Pemeriksaan</Label>
                  <Select value={localFilters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                    <SelectTrigger className="min-w-[180px]">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Tanggal Pemeriksaan</Label>
                  <Input
                    type="date"
                    value={localFilters.tanggal}
                    onChange={(e) => handleFilterChange('tanggal', e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardContent>
            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">No.</th>
                    <th className="px-3 py-2 text-left">Waktu Kunjungan</th>
                    <th className="px-3 py-2 text-left">NIK / NIP</th>
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-left">Tanggal Lahir</th>
                    <th className="px-3 py-2 text-left">Jenis Kelamin</th>
                    <th className="px-3 py-2 text-left">Posisi</th>
                    <th className="px-3 py-2 text-left">Aksi Medis</th>
                  </tr>
                </thead>
                <tbody>
                  {labQueues.data.map((row, idx) => {
                    const statusObj = STATUS.find((s) => s.value === row.status);
                    return (
                      <tr key={row.id} className={`transition-colors duration-200 ${statusObj?.color || ''}`}>
                        <td className="px-3 py-2">{(labQueues.current_page - 1) * labQueues.per_page + idx + 1}</td>
                        <td className="px-3 py-2">{row.waktu}</td>
                        <td className="px-3 py-2">
                          <div>{row.nik}</div>
                          <div className="text-xs text-gray-500">{row.nip}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div>{row.nama}</div>
                          <div className="text-xs text-gray-500">{row.rm}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div>{row.lahir}</div>
                          <div className="text-xs text-gray-500">{row.umur} tahun</div>
                        </td>
                        <td className="px-3 py-2">{row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                        <td className="px-3 py-2">
                          <div>{row.departemen}</div>
                          <div className="text-xs text-gray-500">{row.status_karyawan}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            {row.status === 'belum diperiksa' && (
                              <>
                                <Button size="icon" variant="ghost" title="Mulai Pemeriksaan" onClick={() => handleStatusUpdate(row.id, 'sedang diperiksa', route('lab.show', row.id))}>
                                  <Stethoscope className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" title="Batalkan" onClick={() => handleStatusUpdate(row.id, 'batal')}>
                                  <XCircle className="w-5 h-5 text-red-500" />
                                </Button>
                              </>
                            )}
                            {row.status === 'sedang diperiksa' && (
                              <>
                                <Button size="icon" variant="ghost" title="Lanjutkan Pemeriksaan" onClick={() => router.visit(route('lab.show', row.id))}>
                                  <Stethoscope className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" title="Batalkan" onClick={() => handleStatusUpdate(row.id, 'batal')}>
                                  <XCircle className="w-5 h-5 text-red-500" />
                                </Button>
                              </>
                            )}
                            {row.status === 'selesai' && (
                              <Button size="icon" variant="ghost" title="Print Hasil Lab" onClick={() => router.visit(route('lab.print', row.id))}>
                                <Printer className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Keterangan warna */}
            <div className="mt-4 flex gap-6 text-sm items-center">
              <span className="text-gray-500 font-bold">Keterangan Warna :</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-blue-100 border border-gray-300"></span>
                <span>Belum Diperiksa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-yellow-100 border border-gray-300"></span>
                <span>Sedang Diperiksa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-green-100 border border-gray-300"></span>
                <span>Selesai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-red-100 border border-gray-300"></span>
                <span>Batal</span>
              </div>
            </div>
            {/* Pagination */}
            {labQueues.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((labQueues.current_page - 1) * labQueues.per_page) + 1} - {Math.min(labQueues.current_page * labQueues.per_page, labQueues.total)} dari {labQueues.total} data
                </p>
                <div className="flex gap-2">
                  {labQueues.links.map((link: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (link.url) {
                          router.visit(link.url);
                        }
                      }}
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