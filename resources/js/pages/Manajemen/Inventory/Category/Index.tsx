import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Kategori', href: '' },
];

export default function CategoryIndex({ categories, filters }: any) {
  const { auth } = usePage().props as any;
  const isSuperAdmin = auth.user.role.name === 'super_admin';
  
  const { data: search, setData: setSearch } = useForm({
    search: filters?.search || '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('inventory.category.index'), { search: search.search }, { preserveState: true });
  };

  const handleToggleStatus = (id: string) => {
    router.patch(route('inventory.category.toggle-status', id));
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      router.delete(route('inventory.category.destroy', id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Kategori Inventory" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Kategori Inventory</h1>
            <p className="text-gray-600 mt-1">Kelola kategori untuk mengelompokkan item inventory</p>
          </div>
          <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
            <Link href={route('inventory.category.create')}><Plus className="w-4 h-4 mr-2" />Tambah Kategori</Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Cari nama kategori..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
              </div>
              <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white"><Search className="w-4 h-4 mr-2" />Cari</Button>
            </form>
          </CardContent>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">No.</th>
                    <th className="px-3 py-2 text-left">Nama Kategori</th>
                    {isSuperAdmin && (
                      <>
                        <th className="px-3 py-2 text-left">Perusahaan</th>
                        <th className="px-3 py-2 text-left">Plant/Cabang</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-left">Deskripsi</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.data?.map((category: any, idx: number) => (
                    <tr key={category.id} className={`transition-colors duration-200 ${!category.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                      <td className="px-3 py-2">{(categories.current_page - 1) * categories.per_page + idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{category.name}</td>
                      {isSuperAdmin && (
                        <>
                          <td className="px-3 py-2 text-gray-600">{category.company?.name || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{category.plant?.name || '-'}</td>
                        </>
                      )}
                      <td className="px-3 py-2 text-gray-600">{category.description || '-'}</td>
                      <td className="px-3 py-2">
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get(route('inventory.category.edit', category.id))}
                            className="text-blue-600 hover:bg-blue-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(category.id)}
                            className={category.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                          >
                            {category.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {categories?.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((categories.current_page - 1) * categories.per_page) + 1} - {Math.min(categories.current_page * categories.per_page, categories.total)} dari {categories.total} data
                </p>
                <div className="flex gap-2">
                  {categories.links.map((link: any, index: number) => (
                    <Link
                      key={index}
                      href={link.url}
                      className={`px-3 py-2 text-sm rounded ${
                        link.active
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 