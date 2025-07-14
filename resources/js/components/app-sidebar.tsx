import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Stethoscope, 
    Users, 
    FileText, 
    Settings,
    Building2,
    UserCheck,
    Clock,
    Shield,
    Microscope,
    Package,
    BarChart3,
    Calendar,
    Pill,
    Receipt,
    UserCog,
    Key,
    User,
    Activity
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const medicareNavGroups: NavGroup[] = [
    {
        title: 'Pelayanan',
        items: [
            {
                title: 'Registrasi & Rekam Medis',
                href: '/pelayanan/registrasi-rekam-medis',
                icon: FileText,
            },
            {
                title: 'Rawat Jalan',
                href: '/pelayanan/rawat-jalan',
                icon: Stethoscope,
            },
            {
                title: 'Pemeriksaan Lab',
                href: '/pelayanan/pemeriksaan-lab',
                icon: Microscope,
            },
        ],
    },
    {
        title: 'Manajemen',
        items: [
            {
                title: 'Departemen',
                href: '/manajemen/departemen',
                icon: Building2,
            },
            {
                title: 'Status Karyawan',
                href: '/manajemen/status-karyawan',
                icon: UserCheck,
            },
            {
                title: 'Shift',
                href: '/manajemen/shift',
                icon: Clock,
            },
            {
                title: 'Penjamin',
                href: '/manajemen/penjamin',
                icon: Shield,
            },
            {
                title: 'Laboratorium',
                href: '/manajemen/laboratorium',
                icon: Microscope,
            },
            {
                title: 'Inventory',
                href: '/manajemen/inventory',
                icon: Package,
            },
        ],
    },
    {
        title: 'Laporan',
        items: [
            {
                title: 'Kunjungan Rawat Jalan',
                href: '/laporan/kunjungan-rawat-jalan',
                icon: BarChart3,
            },
            {
                title: 'Kunjungan Pemeriksaan Lab',
                href: '/laporan/kunjungan-pemeriksaan-lab',
                icon: Calendar,
            },
            {
                title: 'Obat Keluar',
                href: '/laporan/obat-keluar',
                icon: Pill,
            },
            {
                title: 'Tagihan',
                href: '/laporan/tagihan',
                icon: Receipt,
            },
        ],
    },
    {
        title: 'Admin Panel',
        items: [
            {
                title: 'Company dan Plant',
                href: '/admin/company-plant',
                icon: Building2,
            },
            {
                title: 'Role dan Hak Akses',
                href: '/admin/role-hak-akses',
                icon: Key,
            },
            {
                title: 'User',
                href: '/admin/user',
                icon: User,
            },
            {
                title: 'Diagnosa',
                href: '/admin/diagnosa',
                icon: Activity,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
