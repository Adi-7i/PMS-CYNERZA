'use client';

import { Booking } from '@/types/booking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecentBookingsProps {
    bookings: Booking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
    return (
        <div className="space-y-8">
            {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${booking.customer?.email}`} alt="Avatar" />
                        <AvatarFallback>{booking.customer?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{booking.customer?.full_name || 'Unknown Guest'}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer?.email || 'No email'}</p>
                    </div>
                    <div className="ml-auto font-medium">
                        +${booking.total_amount}
                    </div>
                </div>
            ))}
        </div>
    );
}
