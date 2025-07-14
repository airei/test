import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Manajemen', href: '#' },
  { title: 'Shift', href: '/manajemen/shift' },
  { title: 'Edit Shift', href: '' },
];

interface Shift {
    id: string;
    company_id?: string;
    plant_id?: string;
    name: string;
    start_time: string;
    end_time: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    shift: Shift;
    companies: any[];
    plants: any[];
    isSuperAdmin: boolean;
}

export default function ShiftEdit({ shift, companies, plants, isSuperAdmin }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        company_id: shift.company_id || '',
        plant_id: shift.plant_id || '',
        name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        description: shift.description || '',
        is_active: shift.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/manajemen/shift/${shift.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Shift - ${shift.name}`} />
            
            <div className="mt-6 space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/manajemen/shift">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Shift</h1>
                        <p className="text-muted-foreground">
                            Perbarui informasi shift "{shift.name}"
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="mr-2 h-5 w-5" />
                            Informasi Shift
                        </CardTitle>
                        <CardDescription>
                            Perbarui informasi shift kerja
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company dan Plant untuk Super Admin */}
                            {isSuperAdmin && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="plant_id">Plant</Label>
                                        <Select
                                            value={data.plant_id}
                                            onValueChange={(value) => setData('plant_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih plant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plants.map((plant: any) => (
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

                            {/* Nama Shift */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Shift *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                    placeholder="Contoh: Shift Pagi, Shift Siang, Shift Malam"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Waktu Mulai */}
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Waktu Mulai *</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_time', e.target.value)}
                                    className={errors.start_time ? 'border-red-500' : ''}
                                />
                                {errors.start_time && (
                                    <p className="text-sm text-red-500">{errors.start_time}</p>
                                )}
                            </div>

                            {/* Waktu Selesai */}
                            <div className="space-y-2">
                                <Label htmlFor="end_time">Waktu Selesai *</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_time', e.target.value)}
                                    className={errors.end_time ? 'border-red-500' : ''}
                                />
                                {errors.end_time && (
                                    <p className="text-sm text-red-500">{errors.end_time}</p>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder="Deskripsi tambahan tentang shift ini (opsional)"
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Status Aktif */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                                />
                                <Label htmlFor="is_active">Shift Aktif</Label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-2">
                                <Link href="/manajemen/shift">
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 