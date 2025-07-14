import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import TextLink from '@/components/text-link';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Departemen', href: '/manajemen/departemen' },
  { title: 'Tambah Departemen', href: '' },
];

interface Props {
  companies: { id: string; name: string }[];
  plants: { id: string; name: string }[];
}

export default function Create({ companies, plants }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    company_id: '',
    plant_id: '',
    name: '',
    description: '',
    is_active: true as boolean,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('departemen.store'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Departemen" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <TextLink href={route('departemen.index')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </TextLink>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tambah Departemen</h1>
              <p className="text-sm text-gray-600">Buat departemen baru untuk organisasi</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Departemen</CardTitle>
            <CardDescription>
              Isi informasi lengkap departemen yang akan dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_id">Perusahaan</Label>
                  <select
                    id="company_id"
                    value={data.company_id}
                    onChange={(e) => setData('company_id', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Pilih perusahaan</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.company_id && <p className="text-sm text-red-600">{errors.company_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plant_id">Plant</Label>
                  <select
                    id="plant_id"
                    value={data.plant_id}
                    onChange={(e) => setData('plant_id', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Pilih plant</option>
                    {plants.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.plant_id && <p className="text-sm text-red-600">{errors.plant_id}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Departemen *</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Masukkan nama departemen"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Masukkan deskripsi departemen (opsional)"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', !!checked)}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={processing}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Menyimpan...' : 'Simpan Departemen'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 