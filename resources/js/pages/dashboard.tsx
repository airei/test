import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { 
    Stethoscope, 
    Microscope, 
    Users, 
    Activity,
    TrendingUp,
    TrendingDown,
    Clock,
    ChevronDown,
    Package,
    AlertTriangle,
    Plus
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ApexChart from 'react-apexcharts';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    metrics: {
        outpatient: {
            today: number;
            percentage_change: number;
            is_increase: boolean;
        };
        laboratory: {
            today: number;
            percentage_change: number;
            is_increase: boolean;
        };
        total_visits: {
            this_month: number;
            percentage_change: number;
            is_increase: boolean;
        };
        unserved_patients: {
            total: number;
            outpatient: number;
            laboratory: number;
        };
        total_patients: number;
    };
    filters: {
        month: number;
        year: number;
        company_id?: string;
        plant_id?: string;
    };
    is_super_admin: boolean;
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    months: Array<{ value: number; label: string }>;
    years: number[];
}

interface FilterOptions {
  penjamin: any[];
  shift: any[];
  status_karyawan: any[];
  departemen: any[];
}

export default function Dashboard({ 
    metrics, 
    filters, 
    is_super_admin, 
    companies, 
    plants, 
    months, 
    years 
}: DashboardProps) {
    // State untuk filter overview
    const [overviewFilter, setOverviewFilter] = useState({
        year: filters.year,
        jenis_pelayanan: '',
        penjamin: '',
        shift: '',
        status_karyawan: '',
        departemen: '',
        ...(is_super_admin ? { company_id: filters.company_id || '', plant_id: filters.plant_id || '' } : {})
    });
    const [overviewData, setOverviewData] = useState({
        categories: [],
        series: []
    });
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        penjamin: [],
        shift: [],
        status_karyawan: [],
        departemen: [],
    });

    // State untuk data demografi
    const [demografiData, setDemografiData] = useState({
        diagnosa: { labels: [], series: [] },
        gender: { labels: [], series: [] },
        penjamin: { labels: [], series: [] },
        age: { labels: [], series: [] },
        shift: { labels: [], series: [] },
        department: { labels: [], series: [] },
        employee_status: { labels: [], series: [] }
    });
    const [loadingDemografi, setLoadingDemografi] = useState(false);

    // State untuk filter demografi
    const [demografiFilter, setDemografiFilter] = useState({
        month: filters.month,
        year: filters.year,
        company_id: is_super_admin ? '' : (filters.company_id || ''),
        plant_id: is_super_admin ? '' : (filters.plant_id || ''),
    });

    // State untuk data operasional
    const [operasionalData, setOperasionalData] = useState({
        obat: { labels: [], series: [] },
        lab: { labels: [], series: [] },
        penjamin: { labels: [], series: [] }
    });
    const [loadingOperasional, setLoadingOperasional] = useState(false);

    // State untuk filter operasional
    const [operasionalFilter, setOperasionalFilter] = useState({
        month: filters.month,
        year: filters.year,
        company_id: is_super_admin ? '' : (filters.company_id || ''),
        plant_id: is_super_admin ? '' : (filters.plant_id || ''),
    });

    // State untuk data low stock
    const [lowStockData, setLowStockData] = useState({
        items: [],
        total_count: 0,
        empty_count: 0,
        low_count: 0
    });
    const [loadingLowStock, setLoadingLowStock] = useState(false);

    // Load filter options when company/plant changes
    useEffect(() => {
      if (is_super_admin && (overviewFilter.company_id !== undefined || overviewFilter.company_id === '') && (overviewFilter.plant_id !== undefined || overviewFilter.plant_id === '')) {
        loadFilterOptions();
      } else if (!is_super_admin) {
        loadFilterOptions();
      }
    }, [overviewFilter.company_id, overviewFilter.plant_id, is_super_admin]);

    const loadFilterOptions = () => {
      let params: any = {};
      if (is_super_admin) {
        if (overviewFilter.company_id !== undefined && overviewFilter.company_id !== '') {
          params.company_id = overviewFilter.company_id;
        }
        if (overviewFilter.plant_id !== undefined && overviewFilter.plant_id !== '') {
          params.plant_id = overviewFilter.plant_id;
        }
      }
      axios.get('/api/dashboard/filters', { params })
          .then(res => setFilterOptions(res.data));
    };

    // Helper: apakah filter lain boleh aktif (super_admin harus pilih company & plant dulu)
    const canShowFilters = is_super_admin 
    ? ((overviewFilter.company_id !== undefined || overviewFilter.company_id === '') && (overviewFilter.plant_id !== undefined || overviewFilter.plant_id === ''))
    : true;

    // Auto select jika hanya ada satu data pada filter
    useEffect(() => {
      if (is_super_admin && companies.length === 1) {
        setOverviewFilter(prev => ({ ...prev, company_id: companies[0].id }));
      }
      if (is_super_admin && plants.length === 1) {
        setOverviewFilter(prev => ({ ...prev, plant_id: plants[0].id }));
      }
    }, [companies, plants, is_super_admin]);

    // Auto select filter options jika hanya ada satu data
    useEffect(() => {
      if (canShowFilters) {
        if (filterOptions.penjamin.length === 1 && !overviewFilter.penjamin) {
          setOverviewFilter(prev => ({ ...prev, penjamin: filterOptions.penjamin[0].id }));
        }
        if (filterOptions.shift.length === 1 && !overviewFilter.shift) {
          setOverviewFilter(prev => ({ ...prev, shift: filterOptions.shift[0].id }));
        }
        if (filterOptions.status_karyawan.length === 1 && !overviewFilter.status_karyawan) {
          setOverviewFilter(prev => ({ ...prev, status_karyawan: filterOptions.status_karyawan[0].id }));
        }
        if (filterOptions.departemen.length === 1 && !overviewFilter.departemen) {
          setOverviewFilter(prev => ({ ...prev, departemen: filterOptions.departemen[0].id }));
        }
      }
      // eslint-disable-next-line
    }, [canShowFilters, filterOptions]);

    // Auto select untuk filter demografi
    useEffect(() => {
      if (is_super_admin && companies.length === 1) {
        setDemografiFilter(prev => ({ ...prev, company_id: companies[0].id }));
      }
      if (is_super_admin && plants.length === 1) {
        setDemografiFilter(prev => ({ ...prev, plant_id: plants[0].id }));
      }
    }, [companies, plants, is_super_admin]);

    // Auto select untuk filter operasional
    useEffect(() => {
      if (is_super_admin && companies.length === 1) {
        setOperasionalFilter(prev => ({ ...prev, company_id: companies[0].id }));
      }
      if (is_super_admin && plants.length === 1) {
        setOperasionalFilter(prev => ({ ...prev, plant_id: plants[0].id }));
      }
    }, [companies, plants, is_super_admin]);

    // Load chart data when filters change
    useEffect(() => {
      if (is_super_admin && (overviewFilter.company_id !== undefined || overviewFilter.company_id === '') && (overviewFilter.plant_id !== undefined || overviewFilter.plant_id === '')) {
        loadOverviewData();
      } else if (!is_super_admin) {
        loadOverviewData();
      }
    }, [overviewFilter, is_super_admin]);

    const loadOverviewData = () => {
        setLoadingOverview(true);
        axios.get('/api/dashboard/overview', { params: overviewFilter })
            .then(res => setOverviewData(res.data))
            .finally(() => setLoadingOverview(false));
    };

    // Load demografi data when filters change
    useEffect(() => {
      if (is_super_admin && (demografiFilter.company_id !== undefined || demografiFilter.company_id === '') && (demografiFilter.plant_id !== undefined || demografiFilter.plant_id === '')) {
        loadDemografiData();
      } else if (!is_super_admin) {
        loadDemografiData();
      }
    }, [demografiFilter, is_super_admin]);

    const loadDemografiData = () => {
      setLoadingDemografi(true);
      let params: any = {
        month: demografiFilter.month,
        year: demografiFilter.year
      };
      
      if (is_super_admin) {
        if (demografiFilter.company_id !== undefined && demografiFilter.company_id !== '') {
          params.company_id = demografiFilter.company_id;
        }
        if (demografiFilter.plant_id !== undefined && demografiFilter.plant_id !== '') {
          params.plant_id = demografiFilter.plant_id;
        }
      }
      
      axios.get('/api/dashboard/demografi', { params })
          .then(res => setDemografiData(res.data))
          .finally(() => setLoadingDemografi(false));
    };

    // Load operasional data when filters change
    useEffect(() => {
      if (is_super_admin && (operasionalFilter.company_id !== undefined || operasionalFilter.company_id === '') && (operasionalFilter.plant_id !== undefined || operasionalFilter.plant_id === '')) {
        loadOperasionalData();
      } else if (!is_super_admin) {
        loadOperasionalData();
      }
    }, [operasionalFilter, is_super_admin]);

    const loadOperasionalData = () => {
      setLoadingOperasional(true);
      let params: any = {
        month: operasionalFilter.month,
        year: operasionalFilter.year
      };
      
      if (is_super_admin) {
        if (operasionalFilter.company_id !== undefined && operasionalFilter.company_id !== '') {
          params.company_id = operasionalFilter.company_id;
        }
        if (operasionalFilter.plant_id !== undefined && operasionalFilter.plant_id !== '') {
          params.plant_id = operasionalFilter.plant_id;
        }
      }
      
      axios.get('/api/dashboard/operasional', { params })
          .then(res => setOperasionalData(res.data))
          .finally(() => setLoadingOperasional(false));
    };

    // Load low stock data when component mounts
    useEffect(() => {
      loadLowStockData();
    }, []);

    const loadLowStockData = () => {
      setLoadingLowStock(true);
      let params: any = {};
      
      if (is_super_admin) {
        if (filters.company_id !== undefined && filters.company_id !== '') {
          params.company_id = filters.company_id;
        }
        if (filters.plant_id !== undefined && filters.plant_id !== '') {
          params.plant_id = filters.plant_id;
        }
      }
      
      axios.get('/api/dashboard/low-stock', { params })
          .then(res => setLowStockData(res.data))
          .finally(() => setLoadingLowStock(false));
    };

    // Handler filter
    const handleOverviewFilter = (key: string, value: string) => {
        setOverviewFilter(prev => {
            const newFilter = { ...prev, [key]: value };
            
            // Reset plant_id when company_id changes to empty (Semua Perusahaan)
            if (key === 'company_id' && value === '') {
                newFilter.plant_id = '';
            }
            
            return newFilter;
        });
    };

    // Handler filter demografi
    const handleDemografiFilter = (key: string, value: string) => {
      setDemografiFilter(prev => {
        const newFilter = { ...prev, [key]: value };
        
        // Reset plant_id when company_id changes to empty (Semua Perusahaan)
        if (key === 'company_id' && value === '') {
          newFilter.plant_id = '';
        }
        
        return newFilter;
      });
    };

    // Handler filter operasional
    const handleOperasionalFilter = (key: string, value: string) => {
      setOperasionalFilter(prev => {
        const newFilter = { ...prev, [key]: value };
        
        // Reset plant_id when company_id changes to empty (Semua Perusahaan)
        if (key === 'company_id' && value === '') {
          newFilter.plant_id = '';
        }
        
        return newFilter;
      });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
                        <p className="text-gray-500 text-base">
                            Selamat datang di sistem Medicare. Pantau data dan aktivitas utama secara ringkas di sini.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <DashboardFilters
                    filters={filters}
                    isSuperAdmin={is_super_admin}
                    companies={companies}
                    plants={plants}
                    months={months}
                    years={years}
                />

                {/* Key Metrics Grid */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {/* Kunjungan Rawat Jalan */}
                    <MetricCard
                        title="Kunjungan Rawat Jalan"
                        value={metrics.outpatient.today}
                        percentageChange={metrics.outpatient.percentage_change}
                        isIncrease={metrics.outpatient.is_increase}
                        icon={<Stethoscope className="w-8 h-8 text-blue-600" />}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                    />

                    {/* Kunjungan Laboratorium */}
                    <MetricCard
                        title="Kunjungan Laboratorium"
                        value={metrics.laboratory.today}
                        percentageChange={metrics.laboratory.percentage_change}
                        isIncrease={metrics.laboratory.is_increase}
                        icon={<Microscope className="w-8 h-8 text-green-600" />}
                        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                    />

                    {/* Total Kunjungan Bulan Ini */}
                    <MetricCard
                        title="Total Kunjungan Bulan Ini"
                        value={metrics.total_visits.this_month}
                        percentageChange={metrics.total_visits.percentage_change}
                        isIncrease={metrics.total_visits.is_increase}
                        icon={<Activity className="w-8 h-8 text-purple-600" />}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                    />

                    {/* Pasien Belum Terlayani */}
                    <MetricCard
                        title="Pasien Belum Terlayani"
                        value={metrics.unserved_patients.total}
                        icon={<Clock className="w-8 h-8 text-red-600" />}
                        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                    />

                    {/* Total Pasien Terdaftar */}
                    <MetricCard
                        title="Total Pasien Terdaftar"
                        value={metrics.total_patients}
                        icon={<Users className="w-8 h-8 text-orange-600" />}
                        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                    />
                </div>

                {/* Detail Pasien Belum Terlayani */}
                {metrics.unserved_patients.total > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Detail Pasien Belum Terlayani</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm text-gray-700">Rawat Jalan</span>
                                </div>
                                <span className="text-lg font-semibold text-blue-700">{metrics.unserved_patients.outpatient}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Microscope className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-gray-700">Laboratorium</span>
                                </div>
                                <span className="text-lg font-semibold text-green-700">{metrics.unserved_patients.laboratory}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accordion Card for Stock Menipis */}
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer bg-gray-100 hover:bg-gray-200 transition rounded-t-xl px-6 py-4 border border-b-0 border-gray-200">
                            <div className="flex items-center space-x-3">
                                <Package className="w-6 h-6 text-orange-600" />
                                <span className="text-lg font-semibold text-gray-900">Stock Menipis & Habis</span>
                                {lowStockData.total_count > 0 && (
                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {lowStockData.total_count}
                                    </span>
                                )}
                            </div>
                            <ChevronDown className="w-6 h-6 text-gray-600" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-800">Stock Habis</p>
                                            <p className="text-2xl font-bold text-red-600">{lowStockData.empty_count}</p>
                                        </div>
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Stock Menipis</p>
                                            <p className="text-2xl font-bold text-yellow-600">{lowStockData.low_count}</p>
                                        </div>
                                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Total Item</p>
                                            <p className="text-2xl font-bold text-blue-600">{lowStockData.total_count}</p>
                                        </div>
                                        <Package className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            {loadingLowStock ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Memuat data stock...</p>
                                </div>
                            ) : lowStockData.items.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-gray-900">Daftar Obat yang Perlu Perhatian</h3>
                                        <button 
                                            onClick={loadLowStockData}
                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                        >
                                            <span>Refresh</span>
                                        </button>
                                    </div>
                                    <div className="grid gap-3">
                                        {lowStockData.items.map((item: any, index: number) => (
                                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-3 h-3 rounded-full ${item.status === 'Habis' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                                <p className="text-sm text-gray-500">
                                                                    Kategori: {item.category} • Unit: {item.unit}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">Stock Saat Ini</p>
                                                            <p className={`text-lg font-bold ${item.status === 'Habis' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                {item.stock}
                                                            </p>
                                                            <p className="text-xs text-gray-500">Min: {item.min_stock}</p>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${item.status_bg} ${item.status_color}`}>
                                                            {item.status}
                                                        </div>
                                                        <button 
                                                            onClick={() => window.open(route('inventory.add-stock', item.id), '_blank')}
                                                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                                                            title="Tambah Stock"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Tidak ada obat dengan stock menipis atau habis</p>
                                    <p className="text-sm text-gray-400 mt-1">Semua stock dalam kondisi aman</p>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Tabs Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <Tabs defaultValue="overview">
                        <TabsList className="mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="demografi">Demografi</TabsTrigger>
                            <TabsTrigger value="operasional">Operasional</TabsTrigger>
                        </TabsList>
                        {/* Tab Overview */}
                        <TabsContent value="overview">
                            {/* Baris filter perusahaan/plant di kanan atas (khusus super admin) */}
                            {is_super_admin && (
                                <div className="flex flex-col items-end mb-3">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col">
                                            <label className="text-xs text-gray-500 mb-1">Perusahaan</label>
                                            <Select value={overviewFilter.company_id || "all"} onValueChange={v => handleOverviewFilter('company_id', v === "all" ? "" : v)}>
                                                <SelectTrigger className="w-fit min-w-[176px]">
                                                    <SelectValue placeholder="Pilih Perusahaan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Perusahaan</SelectItem>
                                                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-xs text-gray-500 mb-1">Plant</label>
                                            <Select value={overviewFilter.plant_id || "all"} onValueChange={v => handleOverviewFilter('plant_id', v === "all" ? "" : v)}>
                                                <SelectTrigger className="w-fit min-w-[176px]">
                                                    <SelectValue placeholder="Pilih Plant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Plant</SelectItem>
                                                    {plants.filter(p => !overviewFilter.company_id || overviewFilter.company_id === '' || p.company_id === overviewFilter.company_id).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Chart Stacked Bar */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <ApexChart
                                    type="bar"
                                    height={320}
                                    options={{
                                        chart: { id: 'overview-stacked-bar', stacked: true },
                                        xaxis: { categories: overviewData.categories },
                                        colors: ['#2563eb', '#f43f5e'],
                                        legend: { position: 'top' },
                                        plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
                                        dataLabels: { enabled: false },
                                    }}
                                    series={overviewData.series}
                                />
                                {loadingOverview && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                            </div>
                            {/* Baris filter utama di bawah chart, rata tengah */}
                            <div className="flex flex-wrap gap-3 items-end justify-center mb-4">
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">Jenis Pelayanan</label>
                                    <Select value={overviewFilter.jenis_pelayanan} onValueChange={v => handleOverviewFilter('jenis_pelayanan', v)} disabled={!canShowFilters}>
                                        <SelectTrigger className="w-fit min-w-[176px]">
                                            <SelectValue placeholder="Pilih Jenis Pelayanan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rawat_jalan">Rawat Jalan</SelectItem>
                                            <SelectItem value="laboratorium">Laboratorium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">Penjamin</label>
                                    <Select value={overviewFilter.penjamin} onValueChange={v => handleOverviewFilter('penjamin', v)} disabled={!canShowFilters}>
                                        <SelectTrigger className="w-fit min-w-[176px]">
                                            <SelectValue placeholder="Pilih Penjamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {canShowFilters && filterOptions.penjamin.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">Shift</label>
                                    <Select value={overviewFilter.shift} onValueChange={v => handleOverviewFilter('shift', v)} disabled={!canShowFilters}>
                                        <SelectTrigger className="w-fit min-w-[176px]">
                                            <SelectValue placeholder="Pilih Shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {canShowFilters && filterOptions.shift.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">Status Karyawan</label>
                                    <Select value={overviewFilter.status_karyawan} onValueChange={v => handleOverviewFilter('status_karyawan', v)} disabled={!canShowFilters}>
                                        <SelectTrigger className="w-fit min-w-[176px]">
                                            <SelectValue placeholder="Pilih Status Karyawan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {canShowFilters && filterOptions.status_karyawan.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">Departemen</label>
                                    <Select value={overviewFilter.departemen} onValueChange={v => handleOverviewFilter('departemen', v)} disabled={!canShowFilters}>
                                        <SelectTrigger className="w-fit min-w-[176px]">
                                            <SelectValue placeholder="Pilih Departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {canShowFilters && filterOptions.departemen.map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                        {/* Tab Demografi */}
                        <TabsContent value="demografi">
                            {/* Filter bulan dan tahun di kanan atas */}
                            <div className="flex justify-end mb-4">
                                <div className="flex gap-3">
                                    {/* Filter perusahaan dan plant untuk super admin */}
                                    {is_super_admin && (
                                        <>
                                            <div className="flex flex-col">
                                                <label className="text-xs text-gray-500 mb-1">Perusahaan</label>
                                                <Select value={demografiFilter.company_id || "all"} onValueChange={v => handleDemografiFilter('company_id', v === "all" ? "" : v)}>
                                                    <SelectTrigger className="w-fit min-w-[176px]">
                                                        <SelectValue placeholder="Pilih Perusahaan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Perusahaan</SelectItem>
                                                        {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-xs text-gray-500 mb-1">Plant</label>
                                                <Select value={demografiFilter.plant_id || "all"} onValueChange={v => handleDemografiFilter('plant_id', v === "all" ? "" : v)}>
                                                    <SelectTrigger className="w-fit min-w-[176px]">
                                                        <SelectValue placeholder="Pilih Plant" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Plant</SelectItem>
                                                        {plants.filter(p => !demografiFilter.company_id || demografiFilter.company_id === '' || p.company_id === demografiFilter.company_id).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Bulan</label>
                                        <Select value={demografiFilter.month.toString()} onValueChange={v => handleDemografiFilter('month', v)}>
                                            <SelectTrigger className="w-fit min-w-[140px]">
                                                <SelectValue placeholder="Pilih Bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Tahun</label>
                                        <Select value={demografiFilter.year.toString()} onValueChange={v => handleDemografiFilter('year', v)}>
                                            <SelectTrigger className="w-fit min-w-[120px]">
                                                <SelectValue placeholder="Tahun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Diagnosa terbanyak (donut) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="donut" 
                                        height={260} 
                                        options={{ 
                                            labels: demografiData.diagnosa.labels,
                                            legend: { position: 'bottom' }
                                        }} 
                                        series={demografiData.diagnosa.series} 
                                    />
                                    <div className="text-center text-xs mt-2">10 Diagnosa Terbanyak</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Jenis kelamin (stack) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="bar" 
                                        height={260} 
                                        options={{
                                            chart: { stacked: true },
                                            xaxis: { categories: demografiData.gender.labels },
                                            legend: { position: 'top' },
                                            colors: ['#2563eb', '#f43f5e'],
                                        }} 
                                        series={[
                                            { name: 'Jumlah', data: demografiData.gender.series }
                                        ]} 
                                    />
                                    <div className="text-center text-xs mt-2">Jenis Kelamin</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Penjamin (stack) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="bar" 
                                        height={260} 
                                        options={{
                                            chart: { stacked: true },
                                            xaxis: { categories: demografiData.penjamin.labels },
                                            legend: { position: 'top' },
                                            colors: ['#10b981', '#f59e0b'],
                                        }} 
                                        series={[
                                            { name: 'Jumlah', data: demografiData.penjamin.series }
                                        ]} 
                                    />
                                    <div className="text-center text-xs mt-2">Penjamin</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Kelompok usia (pie) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="pie" 
                                        height={260} 
                                        options={{ 
                                            labels: demografiData.age.labels,
                                            legend: { position: 'bottom' }
                                        }} 
                                        series={demografiData.age.series} 
                                    />
                                    <div className="text-center text-xs mt-2">Kelompok Usia</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Shift (semi donut) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart
                                        type="donut"
                                        height={260}
                                        options={{
                                            labels: demografiData.shift.labels,
                                            plotOptions: {
                                                pie: {
                                                    startAngle: -90,
                                                    endAngle: 90,
                                                    donut: { size: '75%' },
                                                },
                                            },
                                            legend: { position: 'bottom' },
                                            colors: ['#f59e42', '#38bdf8', '#6366f1'],
                                        }}
                                        series={demografiData.shift.series}
                                    />
                                    <div className="text-center text-xs mt-2">Shift</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Departemen (horizontal column) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart
                                        type="bar"
                                        height={260}
                                        options={{
                                            plotOptions: { bar: { horizontal: true } },
                                            xaxis: { categories: demografiData.department.labels },
                                            colors: ['#10b981'],
                                        }}
                                        series={[{ name: 'Departemen', data: demografiData.department.series }]}
                                    />
                                    <div className="text-center text-xs mt-2">Departemen</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Status Karyawan (bar) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="bar" 
                                        height={260} 
                                        options={{ 
                                            xaxis: { categories: demografiData.employee_status.labels }, 
                                            colors: ['#6366f1'] 
                                        }} 
                                        series={[{ name: 'Status Karyawan', data: demografiData.employee_status.series }]} 
                                    />
                                    <div className="text-center text-xs mt-2">Status Karyawan</div>
                                    {loadingDemografi && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                            </div>
                        </TabsContent>
                        {/* Tab Operasional */}
                        <TabsContent value="operasional">
                            {/* Filter bulan dan tahun di kanan atas */}
                            <div className="flex justify-end mb-4">
                                <div className="flex gap-3">
                                    {/* Filter perusahaan dan plant untuk super admin */}
                                    {is_super_admin && (
                                        <>
                                            <div className="flex flex-col">
                                                <label className="text-xs text-gray-500 mb-1">Perusahaan</label>
                                                <Select value={operasionalFilter.company_id || "all"} onValueChange={v => handleOperasionalFilter('company_id', v === "all" ? "" : v)}>
                                                    <SelectTrigger className="w-fit min-w-[176px]">
                                                        <SelectValue placeholder="Pilih Perusahaan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Perusahaan</SelectItem>
                                                        {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-xs text-gray-500 mb-1">Plant</label>
                                                <Select value={operasionalFilter.plant_id || "all"} onValueChange={v => handleOperasionalFilter('plant_id', v === "all" ? "" : v)}>
                                                    <SelectTrigger className="w-fit min-w-[176px]">
                                                        <SelectValue placeholder="Pilih Plant" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Plant</SelectItem>
                                                        {plants.filter(p => !operasionalFilter.company_id || operasionalFilter.company_id === '' || p.company_id === operasionalFilter.company_id).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Bulan</label>
                                        <Select value={operasionalFilter.month.toString()} onValueChange={v => handleOperasionalFilter('month', v)}>
                                            <SelectTrigger className="w-fit min-w-[140px]">
                                                <SelectValue placeholder="Pilih Bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Tahun</label>
                                        <Select value={operasionalFilter.year.toString()} onValueChange={v => handleOperasionalFilter('year', v)}>
                                            <SelectTrigger className="w-fit min-w-[120px]">
                                                <SelectValue placeholder="Tahun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pengeluaran obat terbanyak (bar/column) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="bar" 
                                        height={260} 
                                        options={{ 
                                            colors: ['#f43f5e'], 
                                            xaxis: { categories: operasionalData.obat.labels },
                                            plotOptions: {
                                                bar: {
                                                    horizontal: true,
                                                }
                                            }
                                        }} 
                                        series={[{ name: 'Pengeluaran', data: operasionalData.obat.series }]} 
                                    />
                                    <div className="text-center text-xs mt-2">20 Pengeluaran Obat Terbanyak</div>
                                    {loadingOperasional && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Pemeriksaan lab terbanyak (bar) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="bar" 
                                        height={260} 
                                        options={{ 
                                            colors: ['#2563eb'], 
                                            xaxis: { categories: operasionalData.lab.labels } 
                                        }} 
                                        series={[{ name: 'Pemeriksaan', data: operasionalData.lab.series }]} 
                                    />
                                    <div className="text-center text-xs mt-2">Pemeriksaan Lab Terbanyak</div>
                                    {loadingOperasional && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                                {/* Penjamin terbanyak (pie) */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ApexChart 
                                        type="pie" 
                                        height={260} 
                                        options={{ 
                                            labels: operasionalData.penjamin.labels,
                                            legend: { position: 'bottom' }
                                        }} 
                                        series={operasionalData.penjamin.series} 
                                    />
                                    <div className="text-center text-xs mt-2">Penjamin Terbanyak</div>
                                    {loadingOperasional && <div className="text-center text-xs text-gray-500 mt-2">Memuat data...</div>}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
