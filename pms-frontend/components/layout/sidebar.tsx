'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    Users,
    Hotel,
    Settings,
    Package
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Bookings', href: '/bookings', icon: BookOpen },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Rooms', href: '/rooms', icon: Hotel },
    { name: 'Inventory', href: '/rooms/inventory', icon: Package },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-white dark:bg-zinc-900 md:flex md:w-64 md:flex-col">
            <div className="flex h-16 items-center px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="text-xl font-bold text-zinc-950 dark:text-white">PMS CYNERZA</span>
                </Link>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                        isActive
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
