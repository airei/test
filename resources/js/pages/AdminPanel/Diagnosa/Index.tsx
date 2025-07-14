import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Search, Edit, Trash2, Power, PowerOff, Upload, Download, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Panel Admin', href: '#' },
  { title: 'Manajemen Diagnosa', href: '' },
];

export default function DiagnosaIndex({ diagnosas, filters, canExport, canImport }: any) {
  const { data: search, setData: setSearch, processing } = useForm({
    search: filters?.search || '',
  });

  const [isSearching, setIsSearching] = useState(false);

  // Debounce auto-search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.search !== (filters?.search || '')) {
        setIsSearching(true);
        router.get(route('diagnosa.index'), { search: search.search }, { 
          preserveState: true,
          onFinish: () => setIsSearching(false)
        });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [search.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    router.get(route('diagnosa.index'), { search: search.search }, { 
      preserveState: true,
      onFinish: () => setIsSearching(false)
    });
  };

  const handleClearSearch = () => {
    setSearch('search', '');
    setIsSearching(true);
    router.get(route('diagnosa.index'), { search: '' }, { 
      preserveState: true,
      onFinish: () => setIsSearching(false)
    });
  };

  if (!diagnosas || !diagnosas.data) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Manajemen Diagnosa" />
        <div className="mt-6">Data diagnosa tidak ditemukan atau sedang dimuat...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Diagnosa" />
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Diagnosa</h1>
          </div>
          <div className="flex gap-2">
            {canExport && (
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                onClick={() => window.open(route('diagnosa.export'), '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            )}
            {canImport && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => router.get(route('diagnosa.import'))}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
            )}
            <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
              <Link href={route('diagnosa.create')}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Diagnosa
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Input 
                  placeholder="Cari berdasarkan Kode, Nama, atau Deskripsi Diagnosa..." 
                  value={search.search} 
                  onChange={e => setSearch('search', e.target.value)}
                  className="pr-20"
                />
                {isSearching && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
                {search.search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white" disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                Cari
              </Button>
            </form>
            {search.search && (
              <div className="mt-3 text-sm text-gray-600">
                {isSearching ? (
                  <span>Mencari...</span>
                ) : (
                  <span>
                    Menampilkan hasil pencarian untuk: <strong>"{search.search}"</strong> 
                    {diagnosas.total > 0 && (
                      <span> - {diagnosas.total} data ditemukan</span>
                    )}
                  </span>
                )}
              </div>
            )}
          </CardContent>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">No.</th>
                    <th className="px-3 py-2 text-left">Kode</th>
                    <th className="px-3 py-2 text-left">Nama Diagnosa</th>
                    <th className="px-3 py-2 text-left">Deskripsi</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosas.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        {search.search ? 
                          `Tidak ada data yang cocok dengan pencarian "${search.search}"` : 
                          'Tidak ada data diagnosa'
                        }
                      </td>
                    </tr>
                  ) : (
                    diagnosas.data.map((diagnosa: any, idx: number) => (
                      <tr key={diagnosa.id} className={`transition-colors duration-200 ${!diagnosa.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                        <td className="px-3 py-2">{(diagnosas.current_page - 1) * diagnosas.per_page + idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{diagnosa.code}</td>
                        <td className="px-3 py-2 font-medium">{diagnosa.name}</td>
                        <td className="px-3 py-2 text-gray-600">{diagnosa.description || '-'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.get(route('diagnosa.edit', diagnosa.id))}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.patch(route('diagnosa.toggle-status', diagnosa.id))}
                              className={diagnosa.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                            >
                              {diagnosa.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.delete(route('diagnosa.destroy', diagnosa.id))}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
            {diagnosas.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((diagnosas.current_page - 1) * diagnosas.per_page) + 1} - {Math.min(diagnosas.current_page * diagnosas.per_page, diagnosas.total)} dari {diagnosas.total} data
                </p>
                <div className="flex gap-2">
                  {diagnosas.links.map((link: any, index: number) => (
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