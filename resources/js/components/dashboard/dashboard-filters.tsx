import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface DashboardFiltersProps {
    filters: {
        month: number;
        year: number;
        company_id?: string;
        plant_id?: string;
    };
    isSuperAdmin: boolean;
    companies: Array<{ id: string; name: string }>;
    plants: Array<{ id: string; name: string; company_id: string }>;
    months: Array<{ value: number; label: string }>;
    years: number[];
}

export function DashboardFilters({ 
    filters, 
    isSuperAdmin, 
    companies, 
    plants, 
    months, 
    years 
}: DashboardFiltersProps) {
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(filters.company_id);
    const [selectedPlantId, setSelectedPlantId] = useState<string | undefined>(filters.plant_id);

    // Update plants when company changes
    useEffect(() => {
        if (selectedCompanyId !== filters.company_id) {
            setSelectedPlantId(undefined);
        }
    }, [selectedCompanyId, filters.company_id]);

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        
        // Remove undefined values
        Object.keys(updatedFilters).forEach(key => {
            if (updatedFilters[key as keyof typeof updatedFilters] === undefined) {
                delete updatedFilters[key as keyof typeof updatedFilters];
            }
        });

        router.get(route('dashboard'), updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMonthChange = (value: string) => {
        updateFilters({ month: parseInt(value) });
    };

    const handleYearChange = (value: string) => {
        updateFilters({ year: parseInt(value) });
    };

    const handleCompanyChange = (value: string) => {
        const companyId = value === 'all' ? undefined : value;
        setSelectedCompanyId(companyId);
        updateFilters({ company_id: companyId, plant_id: undefined });
    };

    const handlePlantChange = (value: string) => {
        const plantId = value === 'all' ? undefined : value;
        setSelectedPlantId(plantId);
        updateFilters({ plant_id: plantId });
    };

    const filteredPlants = selectedCompanyId 
        ? plants.filter(plant => plant.company_id === selectedCompanyId)
        : plants;

    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Month Filter */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Bulan:</label>
                        <Select value={filters.month.toString()} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-fit min-w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value.toString()}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Tahun:</label>
                        <Select value={filters.year.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-fit min-w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Company Filter (Super Admin Only) */}
                    {isSuperAdmin && (
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Perusahaan:</label>
                            <Select 
                                value={selectedCompanyId || 'all'} 
                                onValueChange={handleCompanyChange}
                            >
                                <SelectTrigger className="w-fit min-w-[200px]">
                                    <SelectValue placeholder="Pilih perusahaan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Perusahaan</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Plant Filter (Super Admin Only) */}
                    {isSuperAdmin && (
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Plant:</label>
                            <Select 
                                value={selectedPlantId || 'all'} 
                                onValueChange={handlePlantChange}
                                disabled={!selectedCompanyId}
                            >
                                <SelectTrigger className="w-fit min-w-[200px]">
                                    <SelectValue placeholder="Pilih plant" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Plant</SelectItem>
                                    {filteredPlants.map((plant) => (
                                        <SelectItem key={plant.id} value={plant.id}>
                                            {plant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 