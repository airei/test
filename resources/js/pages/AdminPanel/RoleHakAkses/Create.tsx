import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import React from 'react';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen Role & Hak Akses', href: route('role-hak-akses.index') },
  { title: 'Tambah Role', href: '' },
];

// Tidak perlu group by prefix, cukup group by module
function groupPermissions(modules: any[]) {
  return modules.map((mod: any) => ({
    ...mod,
    permissions: mod.permissions,
  }));
}

export default function CreateRole({ modules }: any) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    display_name: '',
    description: '',
    modules: [] as string[],
  });

  const groupedModules = groupPermissions(modules);

  // Handler untuk module checkbox
  const handleModuleCheck = (mod: any) => {
    const allPermNames = mod.permissions.map((p: any) => p.name);
    const isAllChecked = allPermNames.every((p: string) => data.modules.includes(p));
    if (isAllChecked) {
      setData('modules', data.modules.filter((p: string) => !allPermNames.includes(p)));
    } else {
      setData('modules', Array.from(new Set([...data.modules, ...allPermNames])));
    }
  };

  // Handler untuk granular checkbox
  const handleGranularCheck = (permName: string) => {
    if (data.modules.includes(permName)) {
      setData('modules', data.modules.filter((p: string) => p !== permName));
    } else {
      setData('modules', [...data.modules, permName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('role-hak-akses.store'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Role Baru" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={route('role-hak-akses.index')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tambah Role Baru</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Role</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="display_name">Nama Role</Label>
                <Input
                  id="display_name"
                  value={data.display_name}
                  onChange={(e) => setData('display_name', e.target.value)}
                  required
                />
                {errors.display_name && (
                  <div className="text-red-500 text-xs mt-1">{errors.display_name}</div>
                )}
              </div>

              <div>
                <Label htmlFor="name">Kode Role (unik, tanpa spasi)</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
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
                />
                {errors.description && (
                  <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                )}
              </div>

              <div>
                <Label className="font-bold">Hak Akses Modul</Label>
                <div className="flex flex-col gap-4 mt-2 max-h-96 overflow-y-auto border rounded p-3 bg-gray-50">
                  {groupedModules.map((mod: any) => {
                    const allPermNames = mod.permissions.map((p: any) => p.name);
                    const checkedCount = allPermNames.filter((p: string) => data.modules.includes(p)).length;
                    const isAllChecked = checkedCount === allPermNames.length && allPermNames.length > 0;
                    return (
                      <div key={mod.module} className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={() => handleModuleCheck(mod)}
                            className="accent-blue-600 w-4 h-4 rounded"
                          />
                          <span className="font-bold text-blue-700 text-base">{mod.display}</span>
                          <span className="text-xs text-gray-500 ml-2">{checkedCount}/{allPermNames.length}</span>
                        </div>
                        <div className="ml-6 flex flex-wrap gap-3 mt-1">
                          {mod.permissions.map((perm: any) => (
                            <label key={perm.name} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={data.modules.includes(perm.name)}
                                onChange={() => handleGranularCheck(perm.name)}
                                className="accent-blue-600 w-4 h-4 rounded"
                              />
                              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                                {perm.display_name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 