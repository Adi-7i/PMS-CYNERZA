'use client';


import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ProtectedRoute } from '@/components/layout/protected-route';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-y-auto">
                    <Header />
                    <main className="flex-1 p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
