'use client';

import { CustomerForm } from '@/components/customers/customer-form';

export default function NewCustomerPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
                <p className="text-zinc-500">Create a new customer profile.</p>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <CustomerForm />
            </div>
        </div>
    );
}
