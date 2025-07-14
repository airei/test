import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    NavigationMenu, 
    NavigationMenuItem, 
    NavigationMenuList, 
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
    navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Menu, 
    Search,
    Stethoscope, 
    Users, 
    FileText, 
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
    Key,
    User,
    Activity,
    ClipboardList,
    Syringe,
    TestTube,
    Briefcase,
    CreditCard,
    FileSpreadsheet,
    UserCog,
    ChevronDown
} from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

// Define menu structure with dropdowns
interface MenuItem {
    title: string;
    href?: string;
    icon?: any;
    children?: MenuItem[];
    module?: string;
}

const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        module: 'dashboard',
    },
    {
        title: 'Pelayanan',
        icon: Stethoscope,
        children: [
            {
                title: 'Registrasi & Rekam Medis',
                href: '/pelayanan/registrasi-rekam-medis',
                icon: ClipboardList,
            },
            {
                title: 'Rawat Jalan',
                href: '/pelayanan/rawat-jalan',
                icon: Activity,
            },
            {
                title: 'Pemeriksaan Lab',
                href: '/pelayanan/pemeriksaan-lab',
                icon: TestTube,
            }
        ],
    },
    {
        title: 'Manajemen',
        icon: Briefcase,
        children: [
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
                icon: CreditCard,
            },
            {
                title: 'Laboratorium',
                href: '/manajemen/laboratorium',
                icon: TestTube,
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
        icon: FileSpreadsheet,
        children: [
            {
                title: 'Kunjungan Rawat Jalan',
                href: '/laporan/kunjungan-rawat-jalan',
                icon: Activity,
            },
            {
                title: 'Kunjungan Pemeriksaan Lab',
                href: '/laporan/kunjungan-pemeriksaan-lab',
                icon: TestTube,
            },
            {
                title: 'Angka Kontak',
                href: '/laporan/angka-kontak',
                icon: Users,
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
        icon: UserCog,
        children: [
            {
                title: 'Company dan Plant',
                href: route('company-plant'),
                icon: Building2,
                module: 'admin',
            },
            {
                title: 'Role dan Hak Akses',
                href: '/admin/role-hak-akses',
                icon: Shield,
                module: 'admin',
            },
            {
                title: 'User',
                href: '/admin/user',
                icon: User,
                module: 'admin',
            },
            {
                title: 'Diagnosa',
                href: '/admin/diagnosa',
                icon: FileText,
                module: 'admin',
            },
        ],
    },
];

const rightNavItems: NavItem[] = [
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

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    // === FILTERING MENU BERDASARKAN MODULE ===
    const userModules = auth?.modules || [];
    const canAccess = (module: string) => userModules.includes(module) || userModules.includes('all');
    // Helper untuk filter children
    const filterChildren = (children: any[]) =>
      (children || []).filter(child => {
        if (child.module) return canAccess(child.module);
        // Jika tidak ada module, fallback ke prefix url
        if (child.href) {
          if (child.href.startsWith('/admin/')) return canAccess('admin');
          if (child.href.startsWith('/manajemen/')) return canAccess('manajemen');
          if (child.href.startsWith('/laporan/')) return canAccess('laporan');
          if (child.href.startsWith('/pelayanan/')) return canAccess('pelayanan');
          if (child.href.startsWith('/dashboard')) return canAccess('dashboard');
        }
        return false; // Jangan tampilkan child tanpa module
      });
    // Filter parent menu
    const filteredMenuItems = menuItems
      .map(item => {
        if (item.title === 'Dashboard') {
          return { ...item, show: true };
        }
        if (item.children) {
          const filteredChildren = filterChildren(item.children);
          const show = filteredChildren.length > 0;
          return { ...item, children: filteredChildren, show };
        }
        // Untuk menu tanpa children, cek module dari href atau property module
        let module = item.module || '';
        if (!module && item.href) {
          if (item.href.startsWith('/admin/')) module = 'admin';
          else if (item.href.startsWith('/manajemen/')) module = 'manajemen';
          else if (item.href.startsWith('/laporan/')) module = 'laporan';
          else if (item.href.startsWith('/pelayanan/')) module = 'pelayanan';
          else if (item.href.startsWith('/dashboard')) module = 'dashboard';
        }
        const hasModuleAccess = !module || canAccess(module);
        return { ...item, show: hasModuleAccess };
      })
      .filter(item => item.show !== false);
    // === END FILTERING ===

    return (
        <>
            <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {filteredMenuItems.map((item) => (
                                                <div key={item.title}>
                                                    {item.href ? (
                                                        <Link href={item.href} className="flex items-center space-x-2 font-medium">
                                                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2 font-medium text-muted-foreground">
                                                                {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                                <span>{item.title}</span>
                                                            </div>
                                                            {item.children && (
                                                                <div className="ml-6 space-y-2">
                                                                    {item.children.map((child) => (
                                                                        <Link key={child.title} href={child.href!} className="flex items-center space-x-2 text-sm">
                                                                            {child.icon && <Icon iconNode={child.icon} className="h-4 w-4" />}
                                                                            <span>{child.title}</span>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {filteredMenuItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        {item.href ? (
                                            // Regular menu item
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    page.url === item.href && activeItemStyles,
                                                    'h-9 cursor-pointer px-3',
                                                )}
                                            >
                                                {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                {item.title}
                                            </Link>
                                        ) : (
                                            // Dropdown menu item
                                            <>
                                                <NavigationMenuTrigger className={cn(
                                                    'h-9 cursor-pointer px-3',
                                                    page.url.startsWith(`/${item.title.toLowerCase().replace(' ', '-')}`) && activeItemStyles,
                                                )}>
                                                    {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                    {item.title}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent>
                                                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                        {item.children?.map((child) => (
                                                            <NavigationMenuLink key={child.title} asChild>
                                                                <Link
                                                                    href={child.href!}
                                                                    className={cn(
                                                                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                                        page.url === child.href && "bg-accent text-accent-foreground"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        {child.icon && <Icon iconNode={child.icon} className="h-4 w-4" />}
                                                                        <div className="text-sm font-medium leading-none">{child.title}</div>
                                                                    </div>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        ))}
                                                    </div>
                                                </NavigationMenuContent>
                                            </>
                                        )}
                                        {item.href && page.url === item.href && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer">
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">{item.title}</span>
                                                    {item.icon && <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70 bg-white dark:bg-gray-900">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
