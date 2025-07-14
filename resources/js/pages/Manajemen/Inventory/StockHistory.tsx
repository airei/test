import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, History, Package, TrendingUp, TrendingDown, RotateCcw, Plus, Minus, AlertCircle, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Detail', href: '' },
  { title: 'Riwayat Stock', href: '' },
];

export default function StockHistory({ inventoryItem, history, filters }: any) {
  const { data: search, setData: setSearch } = useForm({
    search: filters?.search || '',
    type: filters?.type || 'all',
    start_date: filters?.start_date || '',
    end_date: filters?.end_date || '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('inventory.stock-history', inventoryItem.id), search, { preserveState: true });
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'adj':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'waste':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'in':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Plus className="w-3 h-3 mr-1" />
            Masuk
          </Badge>
        );
      case 'out':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Minus className="w-3 h-3 mr-1" />
            Keluar
          </Badge>
        );
      case 'adj':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Penyesuaian
          </Badge>
        );
      case 'waste':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pembuangan
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Package className="w-3 h-3 mr-1" />
            Lainnya
          </Badge>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Update breadcrumbs with actual item ID
  const updatedBreadcrumbs = breadcrumbs.map((crumb, index) => {
    if (index === 3) { // Detail breadcrumb
      return { ...crumb, href: route('inventory.show', inventoryItem.id) };
    }
    return crumb;
  });

  return (
    <AppLayout breadcrumbs={updatedBreadcrumbs}>
      <Head title={`Riwayat Stock - ${inventoryItem.name}`} />
      
      <div className="mt-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={route('inventory.show', inventoryItem.id)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Riwayat Stock</h1>
                <p className="text-gray-600 mt-1">Riwayat pergerakan stock untuk {inventoryItem.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Informasi Obat */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Informasi Obat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Obat</label>
                  <p className="font-semibold">{inventoryItem.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Kategori</label>
                  <p className="text-sm text-gray-600">{inventoryItem.category?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock Saat Ini</label>
                  <p className="text-2xl font-bold text-blue-600">
                    {inventoryItem.stock} {inventoryItem.unit?.name || 'unit'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Harga Satuan</label>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(inventoryItem.price || 0)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Transaksi</label>
                  <p className="text-lg font-semibold text-purple-600">
                    {history?.total || 0}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Perusahaan</label>
                  <p className="text-sm text-gray-600">{inventoryItem.company?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Plant</label>
                  <p className="text-sm text-gray-600">{inventoryItem.plant?.name || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Riwayat Stock Movement */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filter Card */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Select value={search.type} onValueChange={value => setSearch('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Jenis Pergerakan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Jenis</SelectItem>
                          <SelectItem value="stock_in">Stok Masuk</SelectItem>
                          <SelectItem value="stock_out">Stok Keluar</SelectItem>
                          <SelectItem value="adjustment">Penyesuaian</SelectItem>
                          <SelectItem value="waste">Pembuangan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input
                        type="date"
                        placeholder="Tanggal Mulai"
                        value={search.start_date}
                        onChange={e => setSearch('start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        placeholder="Tanggal Akhir"
                        value={search.end_date}
                        onChange={e => setSearch('end_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Button type="submit" className="w-full bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                        <Search className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* History Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Riwayat Pergerakan Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left">No.</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">Jenis</th>
                        <th className="px-4 py-3 text-left">Jumlah</th>
                        <th className="px-4 py-3 text-left">Stok Sebelum</th>
                        <th className="px-4 py-3 text-left">Stok Sesudah</th>
                        <th className="px-4 py-3 text-left">Nilai</th>
                        <th className="px-4 py-3 text-left">Referensi</th>
                        <th className="px-4 py-3 text-left">Keterangan</th>
                        <th className="px-4 py-3 text-left">Dibuat Oleh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history?.data?.length > 0 ? (
                        history.data.map((movement: any, idx: number) => {
                          const movementValue = movement.quantity * (inventoryItem.price || 0);
                          
                          return (
                            <tr key={movement.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {(history.current_page - 1) * history.per_page + idx + 1}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {formatDateTime(movement.created_at)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {getMovementTypeIcon(movement.type)}
                                  {getMovementTypeBadge(movement.type)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className={`font-medium ${
                                  movement.type === 'in' ? 'text-green-600' : 
                                  movement.type === 'out' || movement.type === 'waste' ? 'text-red-600' : 
                                  'text-blue-600'
                                }`}>
                                  {movement.type === 'in' ? '+' : movement.type === 'out' || movement.type === 'waste' ? '-' : '±'}
                                  {movement.quantity} {inventoryItem.unit?.name || 'unit'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {movement.stock_before} {inventoryItem.unit?.name || 'unit'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {movement.stock_after} {inventoryItem.unit?.name || 'unit'}
                              </td>
                              <td className="px-4 py-3">
                                <div className={`font-medium ${
                                  movement.type === 'in' ? 'text-green-600' : 
                                  movement.type === 'out' || movement.type === 'waste' ? 'text-red-600' : 
                                  'text-blue-600'
                                }`}>
                                  {formatCurrency(movementValue)}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {movement.reference || '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {movement.notes || '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {movement.created_by?.name || '-'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <History className="w-12 h-12 text-gray-300 mb-4" />
                              <p>Tidak ada data riwayat stock ditemukan</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {history?.links && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex space-x-1">
                      {history.links.map((link: any, index: number) => (
                        <Button
                          key={index}
                          variant={link.active ? "default" : "outline"}
                          size="sm"
                          disabled={!link.url}
                          onClick={() => link.url && router.get(link.url)}
                          className={link.active ? "bg-[#1b7fc4] hover:bg-[#1972af] text-white" : ""}
                        >
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 