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
  { title: 'Manajemen User', href: route('user.index') },
  { title: 'Edit User', href: '' },
];

export default function EditUser({ user, roles, companies, plants }: any) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name || '',
    email: user.email || '',
    password: '',
    password_confirmation: '',
    role_id: user.role_id || '',
    company_id: user.company_id || '',
    plant_id: user.plant_id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('user.update', user.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={route('user.index')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Edit User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
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
                  placeholder="Masukkan email"
                  required
                />
                {errors.email && (
                  <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password Baru (Opsional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
                {errors.password && (
                  <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                )}
              </div>

              <div>
                <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>

              <div>
                <Label htmlFor="role_id">Role</Label>
                <Select
                  value={data.role_id}
                  onValueChange={(value) => setData('role_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && (
                  <div className="text-red-500 text-xs mt-1">{errors.role_id}</div>
                )}
              </div>

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
                <Label htmlFor="plant_id">Plant</Label>
                <Select
                  value={data.plant_id}
                  onValueChange={(value) => setData('plant_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant: any) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.plant_id && (
                  <div className="text-red-500 text-xs mt-1">{errors.plant_id}</div>
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