import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '@/lib/api/calendar';

export function useCalendarAvailability(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['calendar', 'availability', startDate, endDate],
        queryFn: () => calendarApi.getAvailability(startDate, endDate),
        enabled: !!startDate && !!endDate,
    });
}

export function useCalendarBookings(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['calendar', 'bookings', startDate, endDate],
        queryFn: () => calendarApi.getBookings(startDate, endDate),
        enabled: !!startDate && !!endDate,
    });
}
