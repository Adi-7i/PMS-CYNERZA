'use client';

import { BookingForm } from '@/components/bookings/booking-form';

export default function NewBookingPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create New Booking</h1>
                <p className="text-zinc-500">Make a reservation for a customer.</p>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <BookingForm />
            </div>
        </div>
    );
}
