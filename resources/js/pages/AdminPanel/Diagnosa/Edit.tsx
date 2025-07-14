import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen Diagnosa', href: route('diagnosa.index') },
  { title: 'Edit Diagnosa', href: '' },
];

export default function EditDiagnosa({ diagnosa }: any) {
  const { data, setData, put, processing, errors } = useForm({
    code: diagnosa.code || '',
    name: diagnosa.name || '',
    description: diagnosa.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('diagnosa.update', diagnosa.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Diagnosa" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={route('diagnosa.index')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Diagnosa</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Edit Diagnosa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Kode Diagnosa</Label>
                <Input
                  id="code"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  placeholder="Contoh: A00.1"
                  required
                />
                {errors.code && (
                  <div className="text-red-500 text-xs mt-1">{errors.code}</div>
                )}
              </div>

              <div>
                <Label htmlFor="name">Nama Diagnosa</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Masukkan nama diagnosa"
                  required
                />
                {errors.name && (
                  <div className="text-red-500 text-xs mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Masukkan deskripsi diagnosa (opsional)"
                />
                {errors.description && (
                  <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={processing} 
                  className="bg-[#1b7fc4] hover:bg-[#1972af] text-white"
                >
                  {processing ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 