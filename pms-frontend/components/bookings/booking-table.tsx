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
import { Eye, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { BookingStatusBadge } from './booking-status-badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useCancelBooking } from '@/lib/hooks/use-bookings';

interface BookingTableProps {
    data: Booking[];
    isLoading: boolean;
}

export function BookingTable({ data, isLoading }: BookingTableProps) {
    const router = useRouter();
    const cancelBooking = useCancelBooking();
    const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

    const handleCancel = async () => {
        if (bookingToCancel) {
            await cancelBooking.mutateAsync({ id: bookingToCancel, reason: 'Cancelled by user' });
            setBookingToCancel(null);
        }
    };

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
        <>
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
                                        <span className="font-medium">{booking.customer_name}</span>
                                        <span className="text-xs text-zinc-500">{booking.customer_email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{booking.room_type_name}</TableCell>
                                <TableCell>{format(new Date(booking.check_in), 'MMM d, yyyy')}</TableCell>
                                <TableCell>{format(new Date(booking.check_out), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <BookingStatusBadge status={booking.status} />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ${Number(booking.total_amount || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}`)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}/edit`)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Booking
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => setBookingToCancel(booking.id)}
                                                disabled={booking.status === 'cancelled'}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Cancel Booking
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel the booking. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {cancelBooking.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
