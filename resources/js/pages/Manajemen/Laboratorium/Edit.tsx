import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, X, Building2, MapPin } from 'lucide-react';
import InputError from '@/components/input-error';
import { formatCurrency } from '@/lib/currency';

interface Reference {
  id?: string;
  reference_type: 'universal' | 'male' | 'female';
  reference: string;
}

export default function LaboratoriumEdit({ labMaster, companies, plants, isSuperAdmin, userCompany, userPlant }: any) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [plantOptions, setPlantOptions] = useState(plants || []);

  // Pastikan labMaster ada sebelum mengakses propertinya
  if (!labMaster || !labMaster.id) {
    return (
      <AppLayout breadcrumbs={[]}> 
        <div className="mt-6">
          <Card>
            <CardContent>
              <p className="text-red-600">Data laboratorium tidak ditemukan atau tidak valid. Silakan kembali ke daftar laboratorium.</p>
              <Link href={route('laboratorium.index')}>
                <Button className="mt-4">Kembali ke Daftar Laboratorium</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { data, setData, put, processing, errors } = useForm({
    company_id: isSuperAdmin ? (labMaster.company_id || (companies.length > 0 ? companies[0].id : '')) : (userCompany?.id || ''),
    plant_id: isSuperAdmin ? (labMaster.plant_id || (plants.length > 0 ? plants[0].id : '')) : (userPlant?.id || ''),
    name: labMaster.name || '',
    unit: labMaster.unit || '',
    price: labMaster.price ? labMaster.price.toString() : '',
    references: [] as any,
  });

  // Load existing references
  useEffect(() => {
    if (labMaster.references && labMaster.references.length > 0) {
      setReferences(labMaster.references.map((ref: any) => ({
        id: ref.id,
        reference_type: ref.reference_type,
        reference: ref.reference,
      })));
    }
  }, [labMaster.references]);

  useEffect(() => {
    if (isSuperAdmin && data.company_id) {
      fetch(route('laboratorium.plants-by-company', data.company_id))
        .then(res => res.json())
        .then(data => setPlantOptions(data));
    }
  }, [data.company_id]);

  const addReference = () => {
    const newReference: Reference = {
      reference_type: 'universal',
      reference: '',
    };
    setReferences([...references, newReference]);
  };

  const removeReference = (index: number) => {
    const newReferences = references.filter((_, i) => i !== index);
    setReferences(newReferences);
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const newReferences = [...references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setReferences(newReferences);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (references.length === 0) {
      alert('Referensi laboratorium tidak boleh kosong!');
      return;
    }
    
    // Buat payload tanpa references dari data, lalu tambahkan references yang benar
    const { references: _, ...formData } = data;
    const payload = {
      ...formData,
      references,
    };
    
    // Gunakan router.put dengan preserveState false
    router.put(route('laboratorium.update', labMaster.id), payload as any, {
      preserveState: false,
    });
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen', href: '#' },
    { title: 'Laboratorium', href: route('laboratorium.index') },
    { title: 'Edit', href: '' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Laboratorium" />
      
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Laboratorium</h1>
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
            <CardTitle>Form Edit Laboratorium</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company & Plant Section */}
              {isSuperAdmin ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_id">Perusahaan</Label>
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
                    <Label htmlFor="plant_id">Plant</Label>
                    <Select
                      value={data.plant_id}
                      onValueChange={(value) => setData('plant_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih plant" />
                      </SelectTrigger>
                      <SelectContent>
                        {plantOptions.map((plant: any) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InputError message={errors.plant_id} className="mt-2" />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Lokasi Data</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Perusahaan</p>
                        <p className="font-medium">{userCompany?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Plant</p>
                        <p className="font-medium">{userPlant?.name || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Data laboratorium akan tetap terkait dengan perusahaan dan plant Anda.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nama Pemeriksaan</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama pemeriksaan"
                    maxLength={30}
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
                    placeholder="Masukkan unit"
                    maxLength={30}
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
                    placeholder="Masukkan harga"
                    min="0"
                    step="0.01"
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
                  <p className="text-gray-500 text-sm">Belum ada referensi. Klik "Tambah Referensi" untuk menambahkan.</p>
                )}

                {references.map((reference, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        Referensi {index + 1}
                        {reference.id && <span className="text-xs text-gray-500 ml-2">(ID: {reference.id})</span>}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReference(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`reference_type_${index}`}>Jenis Referensi</Label>
                        <Select
                          value={reference.reference_type}
                          onValueChange={(value) => updateReference(index, 'reference_type', value as 'universal' | 'male' | 'female')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis referensi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="universal">Universal (Semua Gender)</SelectItem>
                            <SelectItem value="male">Laki-laki</SelectItem>
                            <SelectItem value="female">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`reference_${index}`}>Nilai Referensi</Label>
                        <Input
                          id={`reference_${index}`}
                          type="text"
                          value={reference.reference}
                          onChange={(e) => updateReference(index, 'reference', e.target.value)}
                          placeholder="Contoh: 10-50 mg/dL"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <Link href={route('laboratorium.index')}>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" disabled={processing || !labMaster.id} className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
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