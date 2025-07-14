import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Departemen', href: route('departemen.index') },
  { title: 'Edit Departemen', href: '' },
];

export default function EditDepartemen({ department, companies, plants }: any) {
  console.log('EditDepartemen props:', { department, companies, plants });
  
  const { data, setData, put, processing, errors } = useForm({
    company_id: department.company_id || '',
    plant_id: department.plant_id || '',
    name: department.name || '',
    description: department.description || '',
    is_active: department.is_active || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('departemen.update', department.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Departemen" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={route('departemen.index')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Departemen</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Edit Departemen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company_id">Perusahaan</Label>
                <select
                  id="company_id"
                  value={data.company_id}
                  onChange={e => setData('company_id', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Pilih perusahaan</option>
                  {companies && companies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.company_id && (
                  <div className="text-red-500 text-xs mt-1">{errors.company_id}</div>
                )}
              </div>
              <div>
                <Label htmlFor="plant_id">Plant</Label>
                <select
                  id="plant_id"
                  value={data.plant_id}
                  onChange={e => setData('plant_id', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Pilih plant</option>
                  {plants && plants.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.plant_id && (
                  <div className="text-red-500 text-xs mt-1">{errors.plant_id}</div>
                )}
              </div>
              <div>
                <Label htmlFor="name">Nama Departemen</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
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
                  onChange={e => setData('description', e.target.value)}
                />
                {errors.description && (
                  <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                )}
              </div>
              <div>
                <Label htmlFor="is_active">Departemen Aktif</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                  />
                </div>
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