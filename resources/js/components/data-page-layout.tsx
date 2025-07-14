import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface Breadcrumb {
  title: string;
  href: string;
}

interface Props {
  breadcrumbs?: Breadcrumb[];
  title: string;
  createRoute: string; // URL untuk tombol "Tambah"
  createLabel: string; // Label tombol "Tambah"
  listRoute: string;   // Route GET index (digunakan untuk pencarian)
  initialSearch?: string;
  searchPlaceholder?: string;
  headerActions?: React.ReactNode; // Tombol tambahan di header (export, import, dll)
  children: React.ReactNode; // Konten (CardContent) setelah form pencarian
  hideDefaultSearch?: boolean; // Jika true, form pencarian default tidak dirender
}

export default function DataPageLayout({
  breadcrumbs = [],
  title,
  createRoute,
  createLabel,
  listRoute,
  initialSearch = '',
  searchPlaceholder = 'Cari...',
  headerActions,
  children,
  hideDefaultSearch,
}: Props) {
  const { data: search, setData: setSearch } = useForm({
    search: initialSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(listRoute, { search: search.search }, { preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={title} />
      <div className="mt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {(createRoute && createLabel) ? (
              <Button asChild className="bg-[#1b7fc4] hover:bg-[#1972af] text-white">
                <Link href={createRoute}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createLabel}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Card utama */}
        <Card>
          {/* Form pencarian */}
          {!hideDefaultSearch && (
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder={searchPlaceholder}
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
          )}

          {/* Konten tabel & lainnya */}
          {children}
        </Card>
      </div>
    </AppLayout>
  );
} 