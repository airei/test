import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    modules: string[];
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface PageProps<T = Record<string, unknown>> extends SharedData {
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Patient {
    id: string;
    name: string;
    nik: string;
    nip: string;
    medical_record_number: string;
    gender: string;
    birth_date: string;
    age: number;
    blood_type: string;
    blood_rhesus: string;
    phone_number: string;
    address: string;
    illness_history: string;
    allergy: string;
    company: { name: string };
    plant: { name: string };
    department: { name: string };
    employee_status: { name: string };
}

export interface OutpatientQueue {
    id: string;
    outpatient_visit_number: string;
    status: string;
    created_at: string;
    patient: Patient;
}

export interface Diagnosa {
    id: string;
    code: string;
    name: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: { name: string };
    unit: { name: string };
    stock: number;
}
