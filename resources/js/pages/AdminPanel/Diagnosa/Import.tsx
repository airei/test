import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen Diagnosa', href: route('diagnosa.index') },
  { title: 'Import', href: '' },
];

export default function Import({ import_errors }: { import_errors?: string[] }) {
  const { data, setData, post, processing, errors } = useForm({
    file: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.file) {
      post(route('diagnosa.import.store'), {
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
      <Head title="Import Diagnosa" />
      <div className="mt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={route('diagnosa.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Import Diagnosa</h1>
            <p className="text-muted-foreground">
              Import data diagnosa dari file Excel
            </p>
          </div>
        </div>

        {/* Error/Success Alert */}
        {import_errors && import_errors.length > 0 && (
          <Alert variant={import_errors[0]?.includes('✅') ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                {import_errors[0]?.includes('✅') ? (
                  <div className="space-y-1">
                    {import_errors.map((message, index) => (
                      <p key={index} className="text-sm font-mono">
                        {message}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      {import_errors.map((error, index) => (
                        <p key={index} className={`text-sm ${
                          error.includes('📊') || error.includes('🚨') || error.includes('💡') 
                            ? 'font-semibold' 
                            : 'font-mono ml-2'
                        }`}>
                          {error}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <h4 className="font-semibold text-blue-800 text-sm mb-2">💡 Cara Memperbaiki Error:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Periksa format file Excel sesuai template</li>
                        <li>• Pastikan heading sesuai: <code className="bg-blue-100 px-1 rounded">kode</code>, <code className="bg-blue-100 px-1 rounded">nama</code>, <code className="bg-blue-100 px-1 rounded">deskripsi</code></li>
                        <li>• Hapus data duplikat atau yang tidak valid</li>
                        <li>• Untuk file besar, bagi menjadi beberapa file kecil</li>
                      </ul>
                    </div>
                  </div>
                )}
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
                  Pilih file Excel (.xlsx atau .xls) yang berisi data diagnosa. 
                  Data dengan kode yang sudah ada akan diupdate, data baru akan ditambahkan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Link href={route('diagnosa.index')}>
                      <Button type="button" variant="outline">
                        Batal
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing || !data.file} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  <h4 className="font-semibold text-sm mb-2 text-blue-600">Perilaku Import:</h4>
                  <div className="text-xs space-y-1 text-gray-600 mb-3">
                    <p>• <b>Update Otomatis:</b> Jika kode diagnosa sudah ada, data akan diupdate</p>
                    <p>• <b>Tambah Baru:</b> Jika kode diagnosa belum ada, data baru akan ditambahkan</p>
                    <p>• <b>Validasi:</b> Kode dan nama wajib diisi, deskripsi opsional</p>
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-2">Format File Excel <span className='text-red-600'>(WAJIB)</span>:</h4>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p>Baris pertama (heading) <b>harus persis</b>:</p>
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-max border text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-2 py-1">kode</th>
                            <th className="border px-2 py-1">nama</th>
                            <th className="border px-2 py-1">deskripsi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2 py-1">J00</td>
                            <td className="border px-2 py-1">Nasopharyngitis akut</td>
                            <td className="border px-2 py-1">Pilek biasa atau selesma</td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-1">K30</td>
                            <td className="border px-2 py-1">Dispepsia</td>
                            <td className="border px-2 py-1">Gangguan pencernaan</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Heading <b>harus persis</b> <code>kode</code>, <code>nama</code>, dan <code>deskripsi</code> (huruf kecil, tanpa spasi)</li>
                      <li>Tidak boleh ada baris kosong di bawah data</li>
                      <li>Tidak boleh ada cell yang hanya berisi spasi</li>
                      <li>File harus .xlsx atau .xls</li>
                      <li>Nama diagnosa maksimal 300 karakter</li>
                      <li>Deskripsi maksimal 300 karakter (opsional)</li>
                      <li>Kode diagnosa maksimal 50 karakter & unik</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Ketentuan:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• Kode diagnosa wajib diisi & unik</li>
                    <li>• Nama diagnosa wajib diisi</li>
                    <li>• Deskripsi boleh kosong (opsional)</li>
                    <li>• Baris kosong akan dilewati</li>
                    <li>• Maksimal 5000 baris per import</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Tips Import:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• Untuk file besar (&gt;1000 baris), bagi menjadi beberapa file</li>
                    <li>• Pastikan tidak ada cell kosong di antara data</li>
                    <li>• Hapus formatting yang tidak perlu di Excel</li>
                    <li>• Jika error memory, coba file dengan jumlah baris lebih sedikit</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Download Template:</h4>
                  <a
                    href={route('diagnosa.template')}
                    className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded shadow"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template Excel
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