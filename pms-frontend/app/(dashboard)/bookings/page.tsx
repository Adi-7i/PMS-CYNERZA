'use client';

import { useState } from 'react';
import { BookingTable } from '@/components/bookings/booking-table';
import { useBookings } from '@/lib/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function BookingsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('all');

    // Note: Backend might support search by customer name in a different endpoint or parameter.
    // For now we just implement status filter.
    const { data, isLoading } = useBookings(page, 10, status === 'all' ? undefined : status);

    const bookings = data?.data || [];
    const total = data?.total || 0;

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
                    {/* Using shadcn Select if available, or just standard HTML select to avoid import errors if not installed. 
                I removed select from customer form earlier. I'll stick to a simple filter dropdown or assume I have it.
                I installed 'dropdown-menu' earlier, but not 'select'?
                Wait, 'select' is a separate component in shadcn. I should install it to be safe.
                
                For now I will comment out the Select component and use a basic HTML select or just buttons to filter.
                Actually I will run command to install select right after this tool call in the same turn or next.
                To avoid build break right now, I will use a simple workaround or just standard select.
            */}
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
                    disabled={!data || bookings.length < 10 || isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
