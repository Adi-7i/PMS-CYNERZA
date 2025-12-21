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
import { Booking } from '@/types/booking';
import { useRouter } from 'next/navigation';
import { Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { BookingStatusBadge } from './booking-status-badge';

interface BookingTableProps {
    data: Booking[];
    isLoading: boolean;
}

export function BookingTable({ data, isLoading }: BookingTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="rounded-md border p-8 text-center text-zinc-500">
                Loading bookings...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-zinc-500">
                No bookings found.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Room Type</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell className="font-medium">#{booking.id}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{booking.customer?.full_name || `Customer ${booking.customer_id}`}</span>
                                    <span className="text-xs text-zinc-500">{booking.customer?.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>{booking.room_type?.name || `Type ${booking.room_type_id}`}</TableCell>
                            <TableCell>{format(new Date(booking.check_in), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{format(new Date(booking.check_out), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                                <BookingStatusBadge status={booking.status} />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                ${booking.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/bookings/${booking.id}`)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/bookings/${booking.id}/edit`)}
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
