import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Search, Edit, Trash2, Power, PowerOff, RefreshCw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen Role & Hak Akses', href: '' },
];

export default function RoleHakAksesIndex({ roles, filters }: any) {
  const { data: search, setData: setSearch } = useForm({
    search: filters?.search || '',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingRoles, setIsSyncingRoles] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('role-hak-akses.index'), { search: search.search }, { preserveState: true });
  };

  const handleSyncModules = () => {
    setIsSyncing(true);
    router.post(route('role-hak-akses.sync-modules'), {}, {
      onFinish: () => setIsSyncing(false)
    });
  };

  const handleSyncRoles = () => {
    setIsSyncingRoles(true);
    // Redirect ke halaman sync roles atau buat endpoint baru
    router.get(route('role-hak-akses.sync-roles'), {}, {
      onFinish: () => setIsSyncingRoles(false)
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Role & Hak Akses" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Role & Hak Akses</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncModules}
              disabled={isSyncing}
              className="bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sinkronisasi...' : 'Sinkron Modul'}
            </Button>
            <Button 
              onClick={handleSyncRoles}
              disabled={isSyncingRoles}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:bg-orange-400"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingRoles ? 'animate-spin' : ''}`} />
              {isSyncingRoles ? 'Sinkronisasi...' : 'Sinkron Role'}
            </Button>
            <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
              <Link href={route('role-hak-akses.create')}><Plus className="w-4 h-4 mr-2" />Tambah Peran</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Cari Nama Peran..." value={search.search} onChange={e => setSearch('search', e.target.value)} />
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
                    <th className="px-3 py-2 text-left">Nama Peran</th>
                    <th className="px-3 py-2 text-left">Kode</th>
                    <th className="px-3 py-2 text-left">Deskripsi</th>
                    <th className="px-3 py-2 text-left">Hak Akses (Modul)</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.data.map((role: any, idx: number) => (
                    <tr key={role.id} className={`transition-colors duration-200 ${!role.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                      <td className="px-3 py-2">{(roles.current_page - 1) * roles.per_page + idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{role.display_name}</td>
                      <td className="px-3 py-2 text-gray-600">{role.name}</td>
                      <td className="px-3 py-2 text-gray-600">{role.description || '-'}</td>
                      <td className="px-3 py-2">
                        {(() => {
                          // Safety check untuk permissions
                          let permissionModules = [];
                          if (role.permissions) {
                            if (Array.isArray(role.permissions)) {
                              // Jika sudah array string
                              permissionModules = role.permissions;
                            } else if (typeof role.permissions === 'object') {
                              // Jika masih objek, extract module
                              permissionModules = Array.isArray(role.permissions) 
                                ? role.permissions.map((p: any) => p.module || p).filter(Boolean)
                                : [];
                            }
                          }
                          
                          return permissionModules.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {permissionModules.map((mod: string, idx: number) => (
                                <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{mod}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get(route('role-hak-akses.edit', role.id))}
                            className="text-blue-600 hover:bg-blue-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.patch(route('role-hak-akses.toggle-status', role.id))}
                            className={role.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                          >
                            {role.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.delete(route('role-hak-akses.destroy', role.id))}
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
            {roles.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((roles.current_page - 1) * roles.per_page) + 1} - {Math.min(roles.current_page * roles.per_page, roles.total)} dari {roles.total} data
                </p>
                <div className="flex gap-2">
                  {roles.links.map((link: any, index: number) => (
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