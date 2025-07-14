import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings, Package, Calculator } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Inventory', href: route('inventory.index') },
  { title: 'Detail', href: route('inventory.show', ':id') },
  { title: 'Atur Stock', href: '' },
];

export default function AdjustStock({ inventoryItem }: any) {
  const { data, setData, post, processing, errors } = useForm({
    adjustment_type: '',
    quantity: '',
    new_stock: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('inventory.adjust-stock', inventoryItem.id));
  };

  const handleQuantityChange = (value: string) => {
    setData('quantity', value);
    if (data.adjustment_type === 'set') {
      setData('new_stock', value);
    } else if (data.adjustment_type === 'add') {
      setData('new_stock', (inventoryItem.stock + parseInt(value) || 0).toString());
    } else if (data.adjustment_type === 'subtract') {
      setData('new_stock', Math.max(0, inventoryItem.stock - parseInt(value) || 0).toString());
    }
  };

  const adjustmentTypes = [
    { value: 'set', label: 'Set Stock (Atur ke nilai tertentu)' },
    { value: 'add', label: 'Tambah Stock' },
    { value: 'subtract', label: 'Kurangi Stock' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Atur Stock - ${inventoryItem.name}`} />
      
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
            <h1 className="text-2xl font-semibold text-gray-900">Atur Stock</h1>
            <p className="text-muted-foreground">
              Atur stock untuk obat {inventoryItem.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Atur Stock */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Form Atur Stock
                </CardTitle>
                <CardDescription>
                  Pilih jenis penyesuaian dan masukkan nilai yang diinginkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="adjustment_type">Jenis Penyesuaian *</Label>
                    <Select
                      value={data.adjustment_type}
                      onValueChange={(value) => setData('adjustment_type', value)}
                    >
                      <SelectTrigger className={errors.adjustment_type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Pilih jenis penyesuaian" />
                      </SelectTrigger>
                      <SelectContent>
                        {adjustmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.adjustment_type && (
                      <p className="text-sm text-red-500">{errors.adjustment_type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      {data.adjustment_type === 'set' ? 'Stock Baru' : 'Jumlah'} *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={data.adjustment_type === 'subtract' ? 0 : 0}
                      max={data.adjustment_type === 'subtract' ? inventoryItem.stock : undefined}
                      value={data.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      placeholder={
                        data.adjustment_type === 'set' 
                          ? 'Masukkan stock baru' 
                          : 'Masukkan jumlah'
                      }
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity}</p>
                    )}
                  </div>

                  {data.adjustment_type && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <Calculator className="w-4 h-4 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Hasil Perhitungan:</p>
                          <p className="text-sm text-blue-700">
                            Stock saat ini: {inventoryItem.stock} → Stock setelah penyesuaian: {data.new_stock || inventoryItem.stock}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      {processing ? 'Mengatur...' : 'Atur Stock'}
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