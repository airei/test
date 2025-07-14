import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Trash2, 
  Settings, 
  History,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '@/lib/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Detail', href: '' },
];

export default function InventoryView({ inventoryItem, stockMovements }: any) {
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { 
      variant: 'destructive' as const, 
      text: 'Habis', 
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-800 border-red-200'
    };
    if (stock <= minStock) return { 
      variant: 'secondary' as const, 
      text: 'Stok Menipis', 
      icon: AlertTriangle,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return { 
      variant: 'default' as const, 
      text: 'Tersedia', 
      icon: Package,
      className: 'bg-green-100 text-green-800 border-green-200'
    };
  };

  const handleEditClick = () => {
    // Simpan URL saat ini ke sessionStorage
    const currentUrl = window.location.href;
    sessionStorage.setItem('inventory_edit_previous_url', currentUrl);
    
    // Navigasi ke halaman edit
    window.location.href = route('inventory.edit', inventoryItem.id);
  };

  const stockStatus = getStockStatus(inventoryItem.stock, inventoryItem.min_stock);

  // Data untuk grafik stock movement
  const chartData = {
    labels: stockMovements?.map((movement: any) => 
      new Date(movement.created_at).toLocaleDateString('id-ID', { 
        month: 'short', 
        day: 'numeric' 
      })
    ) || [],
    datasets: [
      {
        label: 'Stock Movement',
        data: stockMovements?.map((movement: any) => movement.quantity) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Riwayat Pergerakan Stock',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail ${inventoryItem.name}`} />
      
      <div className="mt-6 space-y-6">
        {/* Header dengan tombol aksi */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Detail Obat</h1>
            <p className="text-muted-foreground">Informasi lengkap obat {inventoryItem.name}</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link href={route('inventory.add-stock', inventoryItem.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Stock
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <Link href={route('inventory.reduce-stock', inventoryItem.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Buang Stock
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <Link href={route('inventory.adjust-stock', inventoryItem.id)}>
                <Settings className="w-4 h-4 mr-2" />
                Atur Stock
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={route('inventory.stock-history', inventoryItem.id)}>
                <History className="w-4 h-4 mr-2" />
                Riwayat
              </Link>
            </Button>
            <Button className="bg-[#1b7fc4] hover:bg-[#1972af] text-white" onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button asChild variant="outline">
              <Link href={route('inventory.index')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Utama Obat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Informasi Obat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Obat</label>
                <p className="text-lg font-semibold">{inventoryItem.name}</p>
              </div>
              
              {inventoryItem.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                  <p className="text-gray-700">{inventoryItem.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Kategori</label>
                <p className="text-gray-700">{inventoryItem.category?.name || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Unit</label>
                <p className="text-gray-700">{inventoryItem.unit?.name || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={inventoryItem.is_active ? 'default' : 'secondary'}>
                    {inventoryItem.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Informasi Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Stock Saat Ini</label>
                <p className="text-3xl font-bold text-blue-600">{inventoryItem.stock}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Stock Minimum</label>
                <p className="text-xl font-semibold text-orange-600">{inventoryItem.min_stock}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status Stock</label>
                <div className="mt-1">
                  <Badge variant={stockStatus.variant} className={`flex items-center w-fit ${stockStatus.className}`}>
                    <stockStatus.icon className="w-3 h-3 mr-1" />
                    {stockStatus.text}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Harga Satuan</label>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(inventoryItem.price || 0)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Nilai Total Inventory</label>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency((inventoryItem.stock || 0) * (inventoryItem.price || 0))}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Perusahaan */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Perusahaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Perusahaan</label>
                <p className="text-gray-700">{inventoryItem.company?.name || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Plant</label>
                <p className="text-gray-700">{inventoryItem.plant?.name || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Dibuat Oleh</label>
                <p className="text-gray-700">{inventoryItem.created_by?.name || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Dibuat</label>
                <p className="text-gray-700">
                  {new Date(inventoryItem.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grafik Stock Movement dan Statistik */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Stock Movement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Grafik Pergerakan Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockMovements && stockMovements.length > 0 ? (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada data pergerakan stock</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

          {/* Ringkasan Stock Movement dalam Grid 2x2 */}
          <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Obat Keluar</p>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {stockMovements?.filter((m: any) => m.type === 'out').length || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      stockMovements?.filter((m: any) => m.type === 'out')
                        .reduce((sum: number, m: any) => sum + (m.quantity * (inventoryItem.price || 0)), 0) || 0
                    )}
                  </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Stock Masuk</p>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {stockMovements?.filter((m: any) => m.type === 'in').length || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      stockMovements?.filter((m: any) => m.type === 'in')
                        .reduce((sum: number, m: any) => sum + (m.quantity * (inventoryItem.price || 0)), 0) || 0
                    )}
                  </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-lg w-fit mx-auto mb-3">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Waste</p>
                  <p className="text-2xl font-bold text-red-600 mb-1">
                    {stockMovements?.filter((m: any) => m.type === 'waste').length || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      stockMovements?.filter((m: any) => m.type === 'waste')
                        .reduce((sum: number, m: any) => sum + (m.quantity * (inventoryItem.price || 0)), 0) || 0
                    )}
                  </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Adjustment</p>
                  <p className="text-2xl font-bold text-orange-600 mb-1">
                    {stockMovements?.filter((m: any) => m.type === 'adjustment').length || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      stockMovements?.filter((m: any) => m.type === 'adjustment')
                        .reduce((sum: number, m: any) => sum + (m.quantity * (inventoryItem.price || 0)), 0) || 0
                    )}
                  </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 