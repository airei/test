import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Laboratorium', href: route('laboratorium.index') },
  { title: 'Import', href: '' },
];

export default function Import({ 
  import_errors, 
  isSuperAdmin = false, 
  companies = [], 
  plants = [] 
}: { 
  import_errors?: string[];
  isSuperAdmin?: boolean;
  companies?: Array<{ id: string; name: string }>;
  plants?: Array<{ id: string; name: string; company_id: string }>;
}) {
  const { data, setData, post, processing, errors } = useForm({
    file: null as File | null,
    company_id: '',
    plant_id: '',
  });

  const [filteredPlants, setFilteredPlants] = useState(plants);

  // Normalisasi id dan company_id ke string
  useEffect(() => {
    plants.forEach((plant) => {
      plant.id = String(plant.id);
      plant.company_id = String(plant.company_id);
    });
    companies.forEach((company) => {
      company.id = String(company.id);
    });
  }, [plants, companies]);

  // Filter plants when company changes
  useEffect(() => {
    
    if (data.company_id) {
      const selectedCompanyId = data.company_id;
      const filtered = plants.filter(plant => plant.company_id === selectedCompanyId);
      setFilteredPlants(filtered);
      
      // Reset plant_id if current selection is not in filtered list
      if (data.plant_id && !filtered.find(p => p.id === data.plant_id)) {
        setData('plant_id', '');
      }
    } else {
      setFilteredPlants([]);
      setData('plant_id', '');
    }
  }, [data.company_id, plants]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.file) {
      post(route('laboratorium.import.store'), {
        forceFormData: true,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('file', file);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Import Laboratorium" />
      
      <div className="mt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={route('laboratorium.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Import Laboratorium</h1>
            <p className="text-muted-foreground">
              Import data pemeriksaan laboratorium dari file Excel
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {import_errors && import_errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Terdapat {import_errors.length} error saat import:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {import_errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Import */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload File Excel
                </CardTitle>
                <CardDescription>
                  Pilih file Excel (.xlsx atau .xls) yang berisi data pemeriksaan laboratorium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company and Plant Selection for Super Admin */}
                  {isSuperAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_id">Perusahaan *</Label>
                        <Select 
                          value={data.company_id} 
                          onValueChange={(value) => setData('company_id', value)}
                        >
                          <SelectTrigger className={errors.company_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Pilih perusahaan" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.company_id && (
                          <p className="text-sm text-red-500">{errors.company_id}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plant_id">Plant *</Label>
                        <Select 
                          value={data.plant_id} 
                          onValueChange={(value) => setData('plant_id', value)}
                          disabled={!data.company_id}
                        >
                          <SelectTrigger className={errors.plant_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder={data.company_id ? "Pilih plant" : "Pilih perusahaan dulu"} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredPlants.map((plant) => (
                              <SelectItem key={plant.id} value={plant.id}>
                                {plant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.plant_id && (
                          <p className="text-sm text-red-500">{errors.plant_id}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="file">File Excel *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className={errors.file ? 'border-red-500' : ''}
                    />
                    {errors.file && (
                      <p className="text-sm text-red-500">{errors.file}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Format yang didukung: .xlsx, .xls (Maksimal 10MB)
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Link href={route('laboratorium.index')}>
                      <Button type="button" variant="outline">
                        Batal
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={processing || !data.file || (isSuperAdmin && (!data.company_id || !data.plant_id))} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {processing ? 'Mengupload...' : 'Upload & Import'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informasi dan Template */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Informasi Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Format File Excel <span className='text-red-600'>(WAJIB)</span>:</h4>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p>Baris pertama (heading) <b>harus persis</b>:</p>
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-max border text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-2 py-1">nama_pemeriksaan</th>
                            <th className="border px-2 py-1">satuan</th>
                            <th className="border px-2 py-1">harga</th>
                            <th className="border px-2 py-1">referensi_universal</th>
                            <th className="border px-2 py-1">referensi_pria</th>
                            <th className="border px-2 py-1">referensi_wanita</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2 py-1">Hemoglobin</td>
                            <td className="border px-2 py-1">g/dL</td>
                            <td className="border px-2 py-1">15000</td>
                            <td className="border px-2 py-1">13-17</td>
                            <td className="border px-2 py-1">13-17</td>
                            <td className="border px-2 py-1">12-16</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Heading <b>harus persis</b> seperti di atas (huruf kecil, underscore)</li>
                      <li>Nama pemeriksaan maksimal 255 karakter</li>
                      <li>Satuan maksimal 50 karakter</li>
                      <li>Harga harus angka positif</li>
                      <li>Minimal satu referensi harus diisi</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Ketentuan:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• Nama pemeriksaan wajib diisi dan harus unik per company/plant</li>
                    <li>• Satuan wajib diisi (maksimal 50 karakter)</li>
                    <li>• Harga wajib diisi dan harus angka positif</li>
                    <li>• Minimal satu referensi harus diisi</li>
                    <li>• Baris kosong akan dilewati</li>
                    <li>• Maksimal 10MB per file</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">💡 Cara Import:</h4>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p><b>Untuk User Biasa:</b></p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Download template dan isi data</li>
                      <li>Upload file langsung tanpa pilihan tambahan</li>
                      <li>Data akan otomatis masuk ke company/plant Anda</li>
                    </ul>
                    <p className="mt-2"><b>Untuk Super Admin:</b></p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Download template dan isi data</li>
                      <li>Pilih perusahaan dan plant dari dropdown</li>
                      <li>Upload file untuk import ke company/plant yang dipilih</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <a
                    href={route('laboratorium.template')}
                    className="w-full"
                    download
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 