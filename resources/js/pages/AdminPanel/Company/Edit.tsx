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
  { title: 'Manajemen Perusahaan & Plant', href: route('company-plant') },
  { title: 'Edit Perusahaan', href: '' },
];

export default function EditCompany({ company }: any) {
  const { data, setData, put, processing, errors } = useForm({
    name: company.name || '',
    address: company.address || '',
    phone: company.phone || '',
    email: company.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('company.update', company.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Perusahaan" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={route('company-plant')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Perusahaan</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Edit Perusahaan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Perusahaan</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Masukkan nama perusahaan"
                  required
                />
                {errors.name && (
                  <div className="text-red-500 text-xs mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="Masukkan email perusahaan"
                />
                {errors.email && (
                  <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                  placeholder="Masukkan nomor telepon"
                />
                {errors.phone && (
                  <div className="text-red-500 text-xs mt-1">{errors.phone}</div>
                )}
              </div>

              <div>
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="Masukkan alamat perusahaan"
                />
                {errors.address && (
                  <div className="text-red-500 text-xs mt-1">{errors.address}</div>
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