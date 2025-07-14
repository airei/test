import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Detail', href: route('inventory.show', ':id') },
  { title: 'Buang Stock', href: '' },
];

export default function ReduceStock({ inventoryItem }: any) {
  const { data, setData, post, processing, errors } = useForm({
    quantity: '',
    reason: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('inventory.reduce-stock', inventoryItem.id));
  };

  const wasteReasons = [
    { value: 'expired', label: 'Kadaluarsa' },
    { value: 'damaged', label: 'Rusak' },
    { value: 'contaminated', label: 'Tercemar' },
    { value: 'recall', label: 'Recall Produk' },
    { value: 'other', label: 'Lainnya' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Buang Stock - ${inventoryItem.name}`} />
      
      <div className="mt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={route('inventory.show', inventoryItem.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Buang Stock</h1>
            <p className="text-muted-foreground">
              Buang stock untuk obat {inventoryItem.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Buang Stock */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Form Buang Stock
                </CardTitle>
                <CardDescription>
                  Masukkan jumlah stock yang akan dibuang dan alasan pembuangan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah Stock *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={inventoryItem.stock}
                      value={data.quantity}
                      onChange={(e) => setData('quantity', e.target.value)}
                      placeholder="Masukkan jumlah stock"
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Maksimal: {inventoryItem.stock} {inventoryItem.unit?.name || 'unit'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Alasan Pembuangan *</Label>
                    <Select
                      value={data.reason}
                      onValueChange={(value) => setData('reason', value)}
                    >
                      <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Pilih alasan pembuangan" />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.reason && (
                      <p className="text-sm text-red-500">{errors.reason}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      placeholder="Catatan tambahan (opsional)"
                      rows={3}
                      className={errors.notes ? 'border-red-500' : ''}
                    />
                    {errors.notes && (
                      <p className="text-sm text-red-500">{errors.notes}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Link href={route('inventory.show', inventoryItem.id)}>
                      <Button type="button" variant="outline">
                        Batal
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {processing ? 'Membuang...' : 'Buang Stock'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informasi Obat */}
          <div>
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
                  <label className="text-sm font-medium text-gray-500">Stock Saat Ini</label>
                  <p className="text-2xl font-bold text-blue-600">{inventoryItem.stock}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Harga Satuan</label>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(inventoryItem.price || 0)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Kategori</label>
                  <p className="text-gray-700">{inventoryItem.category?.name || '-'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit</label>
                  <p className="text-gray-700">{inventoryItem.unit?.name || '-'}</p>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <p className="text-sm text-red-700">
                      <strong>Peringatan:</strong> Pembuangan stock tidak dapat dibatalkan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}