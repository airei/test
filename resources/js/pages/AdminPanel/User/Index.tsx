import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Search, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen User', href: '' },
];

export default function UserIndex({ users, filters }: any) {
  const { data: search, setData: setSearch } = useForm({
    search: filters?.search || '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('user.index'), { search: search.search }, { preserveState: true });
  };

  if (!users || !users.data) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Manajemen User" />
        <div className="mt-6">Data user tidak ditemukan atau sedang dimuat...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen User" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen User</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
              <Link href={route('user.create')}><Plus className="w-4 h-4 mr-2" />Tambah User</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Cari Nama User..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
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
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Role</th>
                    <th className="px-3 py-2 text-left">Perusahaan</th>
                    <th className="px-3 py-2 text-left">Plant</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((user: any, idx: number) => (
                    <tr key={user.id} className={`transition-colors duration-200 ${!user.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                      <td className="px-3 py-2">{(users.current_page - 1) * users.per_page + idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{user.name}</td>
                      <td className="px-3 py-2 text-gray-600">{user.email}</td>
                      <td className="px-3 py-2">
                        {user.role ? (
                          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                            {user.role.display_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{user.company?.name || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{user.plant?.name || '-'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get(route('user.edit', user.id))}
                            className="text-blue-600 hover:bg-blue-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.patch(route('user.toggle-status', user.id))}
                            className={user.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                          >
                            {user.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.delete(route('user.destroy', user.id))}
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
            {/* Keterangan warna */}
            <div className="mt-4 flex gap-6 text-sm items-center">
              <span className="text-gray-500 font-bold">Keterangan Warna :</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-[#F0D9D9] hover:bg-[#FBDBDD] border border-gray-300"></span>
                <span>Tidak Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded bg-white hover:bg-[#F5F5F5] border border-gray-300"></span>
                <span>Aktif</span>
              </div>
            </div>
            {/* Pagination */}
            {users.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((users.current_page - 1) * users.per_page) + 1} - {Math.min(users.current_page * users.per_page, users.total)} dari {users.total} data
                </p>
                <div className="flex gap-2">
                  {users.links.map((link: any, index: number) => (
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