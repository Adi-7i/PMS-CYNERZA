'use client';

import { MonthView } from '@/components/calendar/month-view';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
    const router = useRouter();

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => router.push('/bookings/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </div>
            </div>
            <MonthView />
        </div>
    );
}
