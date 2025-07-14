import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen Perusahaan & Plant', href: route('company-plant') },
  { title: 'Tambah Plant', href: '' },
];

export default function CreatePlant({ companies }: any) {
  const { data, setData, post, processing, errors } = useForm({
    company_id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('plant.store'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Plant Baru" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={route('company-plant')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tambah Plant Baru</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Plant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company_id">Perusahaan</Label>
                <Select
                  value={data.company_id}
                  onValueChange={(value) => setData('company_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih perusahaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.company_id && (
                  <div className="text-red-500 text-xs mt-1">{errors.company_id}</div>
                )}
              </div>

              <div>
                <Label htmlFor="name">Nama Plant</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Masukkan nama plant"
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
                  placeholder="Masukkan email plant"
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
                  placeholder="Masukkan alamat plant"
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
                  className="bg-[#19991e] hover:bg-[#167f28] text-white"
                >
                  {processing ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 