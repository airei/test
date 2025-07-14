import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Laboratorium', href: route('laboratorium.index') },
  { title: 'Tambah', href: '' },
];

interface Reference {
  type: 'universal' | 'male' | 'female';
  reference: string;
}

export default function LaboratoriumCreate({ companies, plants, isSuperAdmin, userCompany, userPlant }: any) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [availablePlants, setAvailablePlants] = useState(plants || []);

  // Debug info sementara
  console.log('Debug Create Laboratorium:', {
    isSuperAdmin,
    companies,
    plants,
    userCompany,
    userPlant
  });

  // Set default values berdasarkan role user
  const defaultCompanyId = isSuperAdmin ? '' : (userCompany?.id || '');
  const defaultPlantId = isSuperAdmin ? '' : (userPlant?.id || '');

  const { data, setData, post, processing, errors } = useForm({
    company_id: defaultCompanyId,
    plant_id: defaultPlantId,
    name: '',
    unit: '',
    price: '',
  });

  // Fungsi untuk mendapatkan plants berdasarkan company
  const getPlantsByCompany = async (companyId: string) => {
    if (!companyId) {
      setAvailablePlants([]);
      setData('plant_id', '');
      return;
    }

    try {
      const response = await fetch(route('laboratorium.plants-by-company', { companyId }));
      const plants = await response.json();
      setAvailablePlants(plants);
      setData('plant_id', ''); // Reset plant selection
    } catch (error) {
      console.error('Error fetching plants:', error);
      setAvailablePlants([]);
    }
  };

  // Handle company change
  const handleCompanyChange = (companyId: string) => {
    setData('company_id', companyId);
    if (isSuperAdmin) {
      getPlantsByCompany(companyId);
    }
  };

  const addReference = () => {
    setReferences([...references, { type: 'universal', reference: '' }]);
  };

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const newReferences = [...references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setReferences(newReferences);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Log references state sebelum submit
    console.log('References state sebelum submit:', references);
    
    // Validasi sederhana
    if (isSuperAdmin && !data.company_id) {
      return;
    }

    if (isSuperAdmin && !data.plant_id) {
      return;
    }

    if (!data.name || !data.unit || !data.price) {
      return;
    }

    if (references.length === 0) {
      return;
    }
    
    // Validasi referensi
    const invalidReferences = references.filter(ref => !ref.reference.trim());
    if (invalidReferences.length > 0) {
      return;
    }
    
    // Kirim data dengan cara yang benar untuk Inertia.js
    const formData = new FormData();
    formData.append('company_id', data.company_id);
    formData.append('plant_id', data.plant_id);
    formData.append('name', data.name);
    formData.append('unit', data.unit);
    formData.append('price', data.price);
    
    // Tambahkan references
    references.forEach((ref, index) => {
      formData.append(`references[${index}][type]`, ref.type);
      formData.append(`references[${index}][reference]`, ref.reference);
    });
    
    // Kirim menggunakan fetch API
    fetch(route('laboratorium.store'), {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Accept': 'application/json',
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = route('laboratorium.index');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Laboratorium" />
      
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tambah Laboratorium</h1>
          </div>
          <Button asChild variant="outline">
            <Link href={route('laboratorium.index')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Tambah Laboratorium</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company & Plant Section - Hanya untuk Super Admin */}
              {isSuperAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_id">Perusahaan</Label>
                    <Select
                      value={data.company_id}
                      onValueChange={(value: string) => handleCompanyChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih perusahaan" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InputError message={errors.company_id} className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="plant_id">Plant</Label>
                    <Select
                      value={data.plant_id}
                      onValueChange={(value: string) => setData('plant_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih plant" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlants?.map((plant: any) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InputError message={errors.plant_id} className="mt-2" />
                  </div>
                </div>
              )}

              {/* Data Utama */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="name">Nama Pemeriksaan</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Contoh: Hemoglobin"
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    type="text"
                    value={data.unit}
                    onChange={(e) => setData('unit', e.target.value)}
                    placeholder="Contoh: g/dL"
                  />
                  <InputError message={errors.unit} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  {data.price && (
                    <div className="text-xs text-gray-500 mt-1">{formatCurrency(data.price)}</div>
                  )}
                  <InputError message={errors.price} className="mt-2" />
                </div>
              </div>

              {/* Referensi Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Referensi Laboratorium</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addReference}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Referensi
                  </Button>
                </div>

                {references.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 text-sm">Belum ada referensi. Klik "Tambah Referensi" untuk menambahkan.</p>
                  </div>
                )}

                {references.map((reference, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Referensi {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReference(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Jenis Referensi</Label>
                        <div className="flex flex-col space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`universal-${index}`}
                              name={`reference-type-${index}`}
                              value="universal"
                              checked={reference.type === 'universal'}
                              onChange={(e) => updateReference(index, 'type', e.target.value as 'universal' | 'male' | 'female')}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            />
                            <Label htmlFor={`universal-${index}`} className="text-sm">Universal (Semua Gender)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`male-${index}`}
                              name={`reference-type-${index}`}
                              value="male"
                              checked={reference.type === 'male'}
                              onChange={(e) => updateReference(index, 'type', e.target.value as 'universal' | 'male' | 'female')}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            />
                            <Label htmlFor={`male-${index}`} className="text-sm">Laki-laki</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`female-${index}`}
                              name={`reference-type-${index}`}
                              value="female"
                              checked={reference.type === 'female'}
                              onChange={(e) => updateReference(index, 'type', e.target.value as 'universal' | 'male' | 'female')}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            />
                            <Label htmlFor={`female-${index}`} className="text-sm">Perempuan</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`reference_${index}`}>Nilai Referensi</Label>
                        <Input
                          id={`reference_${index}`}
                          type="text"
                          value={reference.reference}
                          onChange={(e) => updateReference(index, 'reference', e.target.value)}
                          placeholder="Contoh: 12-16 g/dL"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href={route('laboratorium.index')}>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
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