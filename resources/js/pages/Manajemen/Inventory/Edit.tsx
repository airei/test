import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { formatCurrency } from '@/lib/currency';
import axios from 'axios';

export default function InventoryEdit({ inventoryItem, companies, plants, categories, units, isSuperAdmin }: any) {
  const { data, setData, put, processing, errors } = useForm({
    company_id: inventoryItem.company_id || '',
    plant_id: inventoryItem.plant_id || '',
    category_id: inventoryItem.category_id || '',
    unit_id: inventoryItem.unit_id || '',
    name: inventoryItem.name,
    description: inventoryItem.description || '',
    price: inventoryItem.price.toString(),
    min_stock: inventoryItem.min_stock.toString(),
  });

  const [filteredCategories, setFilteredCategories] = useState(categories || []);
  const [filteredUnits, setFilteredUnits] = useState(units || []);
  const [filteredPlants, setFilteredPlants] = useState(plants || []);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);

  // Simpan URL sebelumnya saat component mount
  useEffect(() => {
    // Coba ambil dari sessionStorage terlebih dahulu
    const storedPreviousUrl = sessionStorage.getItem('inventory_edit_previous_url');
    
    if (storedPreviousUrl) {
      setPreviousUrl(storedPreviousUrl);
      // Hapus dari sessionStorage setelah digunakan
      sessionStorage.removeItem('inventory_edit_previous_url');
    } else {
      // Fallback ke document.referrer
      const referrer = document.referrer;
      if (referrer && referrer !== window.location.href && !referrer.includes('/edit')) {
        setPreviousUrl(referrer);
      }
    }
  }, []);

  // Filter plants based on selected company
  useEffect(() => {
    if (data.company_id && isSuperAdmin) {
      const plantsForCompany = plants.filter((plant: any) => plant.company_id === data.company_id);
      setFilteredPlants(plantsForCompany);
      
      // Reset plant selection if current plant doesn't belong to selected company
      if (data.plant_id && !plantsForCompany.find((plant: any) => plant.id === data.plant_id)) {
        setData('plant_id', '');
      }
    } else {
      setFilteredPlants(plants || []);
    }
  }, [data.company_id, plants, isSuperAdmin]);

  // Load categories and units when company or plant changes
  useEffect(() => {
    if (data.company_id && data.plant_id) {
      loadCategoriesAndUnits(data.company_id, data.plant_id);
    } else {
      // For non-super admin, use default categories and units
      if (!isSuperAdmin) {
        setFilteredCategories(categories || []);
        setFilteredUnits(units || []);
      } else {
        setFilteredCategories([]);
        setFilteredUnits([]);
      }
    }
  }, [data.company_id, data.plant_id]);

  const loadCategoriesAndUnits = async (companyId: string, plantId: string) => {
    try {
      const response = await axios.get(route('inventory.categories-units'), {
        params: { company_id: companyId, plant_id: plantId }
      });
      
      setFilteredCategories(response.data.categories);
      setFilteredUnits(response.data.units);
      
      // Don't reset category and unit selection in edit mode if they match
      const categoryExists = response.data.categories.find((cat: any) => cat.id === data.category_id);
      const unitExists = response.data.units.find((unit: any) => unit.id === data.unit_id);
      
      if (!categoryExists) {
        setData(prev => ({ ...prev, category_id: '' }));
      }
      if (!unitExists) {
        setData(prev => ({ ...prev, unit_id: '' }));
      }
    } catch (error) {
      console.error('Error loading categories and units:', error);
      setFilteredCategories([]);
      setFilteredUnits([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('inventory.update', inventoryItem.id), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        if (previousUrl) {
          router.visit(previousUrl, { replace: true });
        } else {
          router.visit(route('inventory.show', inventoryItem.id), { replace: true });
        }
      }
    });
  };

  const handleBack = () => {
    if (previousUrl) {
      window.location.href = previousUrl;
    } else {
      window.history.back();
    }
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen', href: '#' },
    { title: 'Inventory', href: route('inventory.index') },
    { title: 'Detail', href: route('inventory.show', inventoryItem.id) },
    { title: 'Edit', href: '' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Inventory" />
      
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Inventory</h1>
            <p className="text-gray-600 mt-1">Untuk mengubah stok, gunakan fitur manajemen stok di halaman detail.</p>
          </div>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Edit Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isSuperAdmin && (
                  <>
                    <div>
                      <Label htmlFor="company_id">Perusahaan *</Label>
                      <Select
                        value={data.company_id}
                        onValueChange={(value) => setData('company_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih perusahaan" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InputError message={errors.company_id} className="mt-2" />
                    </div>

                    <div>
                      <Label htmlFor="plant_id">Plant *</Label>
                      <Select
                        value={data.plant_id}
                        onValueChange={(value) => setData('plant_id', value)}
                        disabled={!data.company_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih plant" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPlants.map((plant: any) => (
                            <SelectItem key={plant.id} value={plant.id}>
                              {plant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InputError message={errors.plant_id} className="mt-2" />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="category_id">Kategori</Label>
                  <Select
                    value={data.category_id}
                    onValueChange={(value) => setData('category_id', value)}
                    disabled={isSuperAdmin && (!data.company_id || !data.plant_id)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.category_id} className="mt-2" />
                  {isSuperAdmin && (!data.company_id || !data.plant_id) && (
                    <p className="text-sm text-gray-500 mt-1">Pilih perusahaan dan plant terlebih dahulu</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit_id">Unit</Label>
                  <Select
                    value={data.unit_id}
                    onValueChange={(value) => setData('unit_id', value)}
                    disabled={isSuperAdmin && (!data.company_id || !data.plant_id)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUnits.map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.unit_id} className="mt-2" />
                  {isSuperAdmin && (!data.company_id || !data.plant_id) && (
                    <p className="text-sm text-gray-500 mt-1">Pilih perusahaan dan plant terlebih dahulu</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="name">Nama Item *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama item"
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Masukkan deskripsi item"
                    rows={3}
                  />
                  <InputError message={errors.description} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="price">Harga *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    placeholder="Masukkan harga"
                    min="0"
                    step="0.01"
                  />
                  {data.price && (
                    <p className="text-sm text-gray-600 mt-1">
                      Preview: {formatCurrency(parseFloat(data.price) || 0)}
                    </p>
                  )}
                  <InputError message={errors.price} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="min_stock">Stok Minimum *</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={data.min_stock}
                    onChange={(e) => setData('min_stock', e.target.value)}
                    placeholder="Masukkan stok minimum"
                    min="0"
                  />
                  <InputError message={errors.min_stock} className="mt-2" />
                </div>

                {/* Display current stock as read-only info */}
                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Stok Saat Ini</Label>
                      <p className="text-2xl font-bold text-gray-900">{inventoryItem.stock} {inventoryItem.unit?.name || ''}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Harga Saat Ini: {formatCurrency(inventoryItem.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Untuk mengubah stok, kunjungi halaman detail item
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Batal
                </Button>
                <Button type="submit" disabled={processing} className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
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