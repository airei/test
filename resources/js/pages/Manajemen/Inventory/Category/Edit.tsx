import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  plants: Plant[];
}

interface Plant {
  id: string;
  name: string;
  company_id: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  company_id: string;
  plant_id: string;
  company?: Company;
  plant?: Plant;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Kategori', href: '#' },
  { title: 'Edit Kategori', href: '' },
];

export default function EditCategory({ category, companies }: { category: Category; companies?: Company[] }) {
  const { auth } = usePage().props as any;
  const isSuperAdmin = auth.user.role.name === 'super_admin';
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(category.company_id || '');
  const [availablePlants, setAvailablePlants] = useState<Plant[]>(
    companies?.find(c => c.id === category.company_id)?.plants || []
  );

  const { data, setData, put, processing, errors } = useForm({
    name: category.name || '',
    description: category.description || '',
    company_id: category.company_id || '',
    plant_id: category.plant_id || '',
  });

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setData('company_id', companyId);
    setData('plant_id', ''); // Reset plant selection
    
    const selectedCompany = companies?.find(c => c.id === companyId);
    setAvailablePlants(selectedCompany?.plants || []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('inventory.category.update', category.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Kategori Inventory" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Kategori Inventory</h1>
            <p className="text-gray-600 mt-1">Perbarui informasi kategori inventory</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSuperAdmin && companies && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_id">Perusahaan *</Label>
                    <Select
                      value={data.company_id}
                      onValueChange={handleCompanyChange}
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
                    <Label htmlFor="plant_id">Plant/Cabang *</Label>
                    <Select
                      value={data.plant_id}
                      onValueChange={(value) => setData('plant_id', value)}
                      disabled={!selectedCompanyId}
                    >
                      <SelectTrigger className={errors.plant_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Pilih plant/cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlants.map((plant) => (
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
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori *</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  placeholder="Masukkan nama kategori"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Masukkan deskripsi kategori (opsional)"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-[#1b7fc4] hover:bg-[#1972af] text-white"
                >
                  {processing ? 'Menyimpan...' : 'Update Kategori'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={processing}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 