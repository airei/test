import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Plus, Search, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Panel Admin',
        href: '#',
    },
    {
        title: 'Manajemen Perusahaan & Plant',
        href: '',
    },
];

interface Company {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  plants: Plant[];
  created_at: string;
  updated_at: string;
}

interface Plant {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  companies: {
    data: Company[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
  };
  filters: {
    search: string;
  };
}

export default function CompanyPlant({ companies, filters }: Props) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const { data: search, setData: setSearch } = useForm({
    search: filters.search,
  });

  const companyForm = useForm({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const plantForm = useForm({
    company_id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const toggleExpanded = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('company-plant'), { search: search.search }, { preserveState: true });
  };

  const openCompanyModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      companyForm.setData({
        name: company.name,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
      });
    } else {
      setEditingCompany(null);
      companyForm.reset();
    }
    setShowCompanyModal(true);
  };

  const openPlantModal = (plant?: Plant) => {
    if (plant) {
      setEditingPlant(plant);
      plantForm.setData({
        company_id: plant.company_id,
        name: plant.name,
        address: plant.address || '',
        phone: plant.phone || '',
        email: plant.email || '',
      });
    } else {
      setEditingPlant(null);
      plantForm.reset();
    }
    setShowPlantModal(true);
  };

  const submitCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      companyForm.put(route('company.update', editingCompany.id), {
        onSuccess: () => {
          setShowCompanyModal(false);
          setEditingCompany(null);
        },
      });
    } else {
      companyForm.post(route('company.store'), {
        onSuccess: () => {
          setShowCompanyModal(false);
        },
      });
    }
  };

  const submitPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlant) {
      plantForm.put(route('plant.update', editingPlant.id), {
        onSuccess: () => {
          setShowPlantModal(false);
          setEditingPlant(null);
        },
      });
    } else {
      plantForm.post(route('plant.store'), {
        onSuccess: () => {
          setShowPlantModal(false);
        },
      });
    }
  };

  const deleteCompany = (company: Company) => {
    router.delete(route('company.destroy', company.id));
  };

  const deletePlant = (plant: Plant) => {
    router.delete(route('plant.destroy', plant.id));
  };

  const toggleCompanyStatus = (company: Company) => {
    router.patch(route('company.toggle-status', company.id));
  };

  const togglePlantStatus = (plant: Plant) => {
    router.patch(route('plant.toggle-status', plant.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company & Plant Management"/>
      
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Perusahaan & Plant</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => openCompanyModal()} className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Perusahaan
            </Button>
            <Button onClick={() => openPlantModal()} className="bg-[#19991e] hover:bg-[#167f28] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Cabang
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari Perusahaan..."
                  value={search.search}
                  onChange={(e) => setSearch('search', e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                <Search className="w-4 h-4 mr-2" />
                Cari
              </Button>
            </form>
          </CardContent>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">No.</th>
                    <th className="px-3 py-2 text-left">Nama Perusahaan</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Telepon</th>
                    <th className="px-3 py-2 text-left">Alamat</th>
                    <th className="px-3 py-2 text-left">Total Cabang</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.data.map((company, idx) => (
                    <React.Fragment key={company.id}>
                      <tr className={`transition-colors duration-200 ${!company.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}>
                        <td className="px-3 py-2">{(companies.current_page - 1) * companies.per_page + idx + 1}</td>
                        <td className="px-3 py-2 font-medium">{company.name}</td>
                        <td className="px-3 py-2 text-gray-600">{company.email || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{company.phone || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{company.address || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{company.plants.length}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(company.id)}
                              className="text-gray-600 hover:bg-gray-100"
                            >
                              {expandedCompanies.has(company.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.get(route('company.edit', company.id))}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCompanyStatus(company)}
                              className={company.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                            >
                              {company.is_active ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCompany(company)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Plants Section */}
                      {expandedCompanies.has(company.id) && company.plants.length > 0 && (
                        <tr>
                          <td colSpan={7} className="px-0 py-0">
                            <div className="bg-gray-50 border-t">
                              <div className="p-4">
                                <h4 className="font-medium text-gray-700 mb-3">Daftar Cabang:</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="px-3 py-2 text-left">Nama Cabang</th>
                                        <th className="px-3 py-2 text-left">Email</th>
                                        <th className="px-3 py-2 text-left">Telepon</th>
                                        <th className="px-3 py-2 text-left">Alamat</th>
                                        <th className="px-3 py-2 text-left">Aksi</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {company.plants.map((plant) => (
                                        <tr
                                          key={plant.id}
                                          className={`transition-colors duration-200 ${!plant.is_active ? 'bg-[#F0D9D9] hover:bg-[#FBDBDD]' : 'bg-white hover:bg-[#F5F5F5]'}`}
                                        >
                                          <td className="px-3 py-2 font-medium">{plant.name}</td>
                                          <td className="px-3 py-2 text-gray-600">{plant.email || '-'}</td>
                                          <td className="px-3 py-2 text-gray-600">{plant.phone || '-'}</td>
                                          <td className="px-3 py-2 text-gray-600">{plant.address || '-'}</td>
                                          <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.get(route('plant.edit', plant.id))}
                                                className="text-blue-600 hover:bg-blue-100"
                                              >
                                                <Edit className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => togglePlantStatus(plant)}
                                                className={plant.is_active ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}
                                              >
                                                {plant.is_active ? (
                                                  <PowerOff className="w-4 h-4" />
                                                ) : (
                                                  <Power className="w-4 h-4" />
                                                )}
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deletePlant(plant)}
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
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
            {companies.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {((companies.current_page - 1) * companies.per_page) + 1} - {Math.min(companies.current_page * companies.per_page, companies.total)} dari {companies.total} data
                </p>
                <div className="flex gap-2">
                  {companies.links.map((link: any, index: number) => (
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

      {/* Company Modal */}
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCompany} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Perusahaan</Label>
              <Input
                id="name"
                value={companyForm.data.name}
                onChange={(e) => companyForm.setData('name', e.target.value)}
                required
              />
              {companyForm.errors.name && (
                <div className="text-red-500 text-xs mt-1">{companyForm.errors.name}</div>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyForm.data.email}
                onChange={(e) => companyForm.setData('email', e.target.value)}
              />
              {companyForm.errors.email && (
                <div className="text-red-500 text-xs mt-1">{companyForm.errors.email}</div>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                value={companyForm.data.phone}
                onChange={(e) => companyForm.setData('phone', e.target.value)}
              />
              {companyForm.errors.phone && (
                <div className="text-red-500 text-xs mt-1">{companyForm.errors.phone}</div>
              )}
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={companyForm.data.address}
                onChange={(e) => companyForm.setData('address', e.target.value)}
              />
              {companyForm.errors.address && (
                <div className="text-red-500 text-xs mt-1">{companyForm.errors.address}</div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompanyModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={companyForm.processing} 
                className="bg-[#1b7fc4] hover:bg-[#1972af] text-white"
              >
                {editingCompany ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Plant Modal */}
      <Dialog open={showPlantModal} onOpenChange={setShowPlantModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlant ? 'Edit Plant' : 'Add New Plant'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitPlant} className="space-y-4">
            <div>
              <Label htmlFor="company_id">Perusahaan</Label>
              <Select
                value={plantForm.data.company_id}
                onValueChange={(value) => plantForm.setData('company_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perusahaan" />
                </SelectTrigger>
                <SelectContent>
                  {companies.data.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {plantForm.errors.company_id && (
                <div className="text-red-500 text-xs mt-1">{plantForm.errors.company_id}</div>
              )}
            </div>
            <div>
              <Label htmlFor="plant_name">Nama Cabang</Label>
              <Input
                id="plant_name"
                value={plantForm.data.name}
                onChange={(e) => plantForm.setData('name', e.target.value)}
                required
              />
              {plantForm.errors.name && (
                <div className="text-red-500 text-xs mt-1">{plantForm.errors.name}</div>
              )}
            </div>
            <div>
              <Label htmlFor="plant_email">Email</Label>
              <Input
                id="plant_email"
                type="email"
                value={plantForm.data.email}
                onChange={(e) => plantForm.setData('email', e.target.value)}
              />
              {plantForm.errors.email && (
                <div className="text-red-500 text-xs mt-1">{plantForm.errors.email}</div>
              )}
            </div>
            <div>
              <Label htmlFor="plant_phone">Telepon</Label>
              <Input
                id="plant_phone"
                value={plantForm.data.phone}
                onChange={(e) => plantForm.setData('phone', e.target.value)}
              />
              {plantForm.errors.phone && (
                <div className="text-red-500 text-xs mt-1">{plantForm.errors.phone}</div>
              )}
            </div>
            <div>
              <Label htmlFor="plant_address">Alamat</Label>
              <Input
                id="plant_address"
                value={plantForm.data.address}
                onChange={(e) => plantForm.setData('address', e.target.value)}
              />
              {plantForm.errors.address && (
                <div className="text-red-500 text-xs mt-1">{plantForm.errors.address}</div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPlantModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={plantForm.processing} 
                className="bg-[#19991e] hover:bg-[#167f28] text-white"
              >
                {editingPlant ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
} 