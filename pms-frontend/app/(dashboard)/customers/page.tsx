'use client';

import { useState } from 'react';
import { CustomerTable } from '@/components/customers/customer-table';
import { useCustomers } from '@/lib/hooks/use-customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useCustomers(page, 10, search);

    // Backend returns array directly, not wrapped in {data:...}
    const customers = Array.isArray(data) ? data : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Customers</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your hotel guests and customer data.</p>
                </div>
                <Button onClick={() => router.push('/customers/new')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Customer
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <CustomerTable data={customers} isLoading={isLoading} />

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={customers.length < 10 || isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
