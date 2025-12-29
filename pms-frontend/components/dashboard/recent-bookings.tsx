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
                        <AvatarImage src={`https://avatar.vercel.sh/${booking.customer_email}`} alt="Avatar" />
                        <AvatarFallback>{booking.customer_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{booking.customer_name || 'Unknown Guest'}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer_email || 'No email'}</p>
                    </div>
                    <div className="ml-auto font-medium">
                        +${Number(booking.total_amount || 0).toFixed(2)}
                    </div>
                </div>
            ))}
        </div>
    );
}
