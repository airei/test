import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Detail', href: route('inventory.show', ':id') },
  { title: 'Tambah Stock', href: '' },
];

export default function AddStock({ inventoryItem }: any) {
  const { data, setData, post, processing, errors } = useForm({
    quantity: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('inventory.add-stock', inventoryItem.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Tambah Stock - ${inventoryItem.name}`} />
      
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
            <h1 className="text-2xl font-semibold text-gray-900">Tambah Stock</h1>
            <p className="text-muted-foreground">
              Tambah stock untuk obat {inventoryItem.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tambah Stock */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Form Tambah Stock
                </CardTitle>
                <CardDescription>
                  Masukkan jumlah stock yang akan ditambahkan
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
                      value={data.quantity}
                      onChange={(e) => setData('quantity', e.target.value)}
                      placeholder="Masukkan jumlah stock"
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity}</p>
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
                    <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      {processing ? 'Menambahkan...' : 'Tambah Stock'}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 