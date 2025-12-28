'use client';

import { useState } from 'react';
import { BookingTable } from '@/components/bookings/booking-table';
import { useBookings } from '@/lib/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function BookingsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('all');

    const { data, isLoading } = useBookings(page, 10, status === 'all' ? undefined : status);

    // Backend returns array directly, not wrapped in {data:...}
    const bookings = Array.isArray(data) ? data : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Bookings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">View and manage hotel reservations.</p>
                </div>
                <Button onClick={() => router.push('/bookings/new')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Booking
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-[180px]">
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <BookingTable data={bookings} isLoading={isLoading} />

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
                    disabled={bookings.length < 10 || isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
