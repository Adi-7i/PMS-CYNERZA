'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Customer } from '@/types/customer';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash } from 'lucide-react';

interface CustomerTableProps {
    data: Customer[];
    isLoading: boolean;
}

export function CustomerTable({ data, isLoading }: CustomerTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="rounded-md border p-8 text-center text-zinc-500">
                Loading customers...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-zinc-500">
                No customers found.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone || '-'}</TableCell>
                            <TableCell className="text-right">
                                {customer.total_balance_due > 0 ? (
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                        ${Number(customer.total_balance_due).toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="text-zinc-500">$0.00</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/customers/${customer.id}`)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/customers/${customer.id}/edit`)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
