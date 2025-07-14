import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
    ChevronDown, 
    ChevronRight, 
    Home, 
    Users, 
    Building2, 
    Settings, 
    FileText, 
    BarChart3, 
    Calendar, 
    Shield, 
    Database, 
    Activity,
    Stethoscope,
    Microscope,
    Pill,
    UserCheck,
    Clock,
    Package,
    Receipt,
    Key,
    User,
    ClipboardList,
    Syringe,
    Heart,
    TestTube,
    Briefcase,
    CreditCard,
    FileSpreadsheet,
    UserCog
} from 'lucide-react';
import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export function NavMain() {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const { auth } = usePage().props as any;
    const userModules = auth?.modules || [];

    // Debug log
    console.log('=== NAV MAIN DEBUG ===');
    console.log('Auth modules:', userModules);
    console.log('Auth data:', auth);

    // Helper untuk cek akses module
    const canAccess = (module: string) => userModules.includes(module) || userModules.includes('all');

    // Helper untuk filter children
    const filterChildren = (children: any[]) =>
      (children || []).filter(child => !child.module || canAccess(child.module));

    const toggleMenu = (menuId: string) => {
        setOpenMenus(prev => 
            prev.includes(menuId) 
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Home,
            href: route('dashboard'),
            type: 'link' as const,
            module: 'dashboard',
            show: canAccess('dashboard')
        },
        {
            id: 'pelayanan',
            label: 'Pelayanan',
            icon: Stethoscope,
            type: 'dropdown' as const,
            children: [
                {
                    id: 'registrasi-rekam-medis',
                    label: 'Registrasi & Rekam Medis',
                    icon: ClipboardList,
                    href: '#registrasi-rekam-medis',
                    module: 'pelayanan',
                },
                {
                    id: 'rawat-jalan',
                    label: 'Rawat Jalan',
                    icon: Activity,
                    href: '#rawat-jalan',
                    module: 'pelayanan',
                },
                {
                    id: 'pemeriksaan-lab',
                    label: 'Pemeriksaan Lab',
                    icon: TestTube,
                    href: '#pemeriksaan-lab',
                    module: 'pelayanan',
                }
            ]
        },
        {
            id: 'manajemen',
            label: 'Manajemen',
            icon: Briefcase,
            type: 'dropdown' as const,
            children: [
                {
                    id: 'departemen',
                    label: 'Departemen',
                    icon: Building2,
                    href: '#departemen',
                    module: 'manajemen',
                },
                {
                    id: 'status-karyawan',
                    label: 'Status Karyawan',
                    icon: UserCheck,
                    href: '#status-karyawan',
                    module: 'manajemen',
                },
                {
                    id: 'shift',
                    label: 'Shift',
                    icon: Clock,
                    href: '#shift',
                    module: 'manajemen',
                },
                {
                    id: 'penjamin',
                    label: 'Penjamin',
                    icon: CreditCard,
                    href: '#penjamin',
                    module: 'manajemen',
                },
                {
                    id: 'laboratorium',
                    label: 'Laboratorium',
                    icon: TestTube,
                    href: '#laboratorium',
                    module: 'manajemen',
                },
                {
                    id: 'inventory',
                    label: 'Inventory',
                    icon: Package,
                    href: '#inventory',
                    module: 'manajemen',
                }
            ]
        },
        {
            id: 'laporan',
            label: 'Laporan',
            icon: FileSpreadsheet,
            type: 'dropdown' as const,
            children: [
                {
                    id: 'kunjungan-rawat-jalan',
                    label: 'Kunjungan Rawat Jalan',
                    icon: Activity,
                    href: route('laporan.kunjungan-rawat-jalan'),
                    module: 'laporan',
                },
                {
                    id: 'kunjungan-pemeriksaan-lab',
                    label: 'Kunjungan Pemeriksaan Lab',
                    icon: TestTube,
                    href: route('laporan.kunjungan-pemeriksaan-lab'),
                    module: 'laporan',
                },
                {
                    id: 'angka-kontak',
                    label: 'Angka Kontak',
                    icon: Users,
                    href: route('laporan.angka-kontak'),
                    module: 'laporan',
                },
                {
                    id: 'obat-keluar',
                    label: 'Obat Keluar',
                    icon: Pill,
                    href: '#obat-keluar',
                    module: 'laporan',
                },
                {
                    id: 'tagihan',
                    label: 'Tagihan',
                    icon: Receipt,
                    href: '#tagihan',
                    module: 'laporan',
                }
            ]
        },
        {
            id: 'admin-panel',
            label: 'Admin Panel',
            icon: UserCog,
            type: 'dropdown' as const,
            children: [
                {
                    id: 'company-plant',
                    label: 'Company dan Plant',
                    icon: Building2,
                    href: route('company-plant'),
                    module: 'admin',
                },
                {
                    id: 'role-hak-akses',
                    label: 'Role dan Hak Akses',
                    icon: Shield,
                    href: '#role-hak-akses',
                    module: 'admin',
                },
                {
                    id: 'user',
                    label: 'User',
                    icon: User,
                    href: '#user',
                    module: 'admin',
                },
                {
                    id: 'diagnosa',
                    label: 'Diagnosa',
                    icon: FileText,
                    href: '#diagnosa',
                    module: 'admin',
                }
            ]
        },
    ];

    // Filter children dan parent
    const filteredMenuItems = menuItems
      .map(item => {
        if (item.children) {
          const filteredChildren = filterChildren(item.children);
          // Parent menu hanya ditampilkan jika ada children yang bisa diakses
          const show = filteredChildren.length > 0;
          console.log(`Menu ${item.id}: ${show ? 'SHOW' : 'HIDE'} (${filteredChildren.length} children)`);
          return { ...item, children: filteredChildren, show };
        }
        // Untuk menu tanpa children, cek apakah punya module dan user bisa akses
        const hasModuleAccess = !item.module || canAccess(item.module);
        console.log(`Menu ${item.id}: ${hasModuleAccess ? 'SHOW' : 'HIDE'} (module: ${item.module})`);
        return { ...item, show: hasModuleAccess };
      })
      .filter(item => item.show !== false);

    return (
        <SidebarMenu>
            {filteredMenuItems.map((item) => {
                if (item.type === 'dropdown') {
                    const isOpen = openMenus.includes(item.id);
                    const IconComponent = item.icon;

                    return (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                onClick={() => toggleMenu(item.id)}
                            >
                                <IconComponent className="size-4" />
                                <span className="truncate">{item.label}</span>
                                {isOpen ? (
                                    <ChevronDown className="ml-auto size-4 transition-transform" />
                                ) : (
                                    <ChevronRight className="ml-auto size-4 transition-transform" />
                                )}
                            </SidebarMenuButton>
                            
                            {isOpen && (
                                <SidebarMenuSub>
                                    {item.children?.map((child) => {
                                        const ChildIconComponent = child.icon;
                                        return (
                                            <SidebarMenuSubItem key={child.id}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={child.href}>
                                                        <ChildIconComponent className="size-4" />
                                                        <span className="truncate">{child.label}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>
                    );
                }

                // Regular link item
                const IconComponent = item.icon;
                return (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                            <Link href={item.href}>
                                <IconComponent className="size-4" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
