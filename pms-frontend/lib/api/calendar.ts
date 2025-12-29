import { apiClient } from './client';
import { Booking } from '@/types/booking';

export interface CalendarAvailability {
    date: string;
    room_type_id: number;
    room_type_name: string;
    available_rooms: number;
    total_rooms: number;
    price: string;
    status: 'available' | 'partial' | 'full';
}

export interface BookingEvent {
    booking_id: number;
    title: string;
    room_type_id: number;
    room_type_name: string;
    customer_name: string;
    start: string;
    end: string;
    num_rooms: number;
    status: string;
}

export const calendarApi = {
    getAvailability: async (startDate: string, endDate: string, roomTypeId?: number) => {
        // Backend expects query params: start, end (not start_date, end_date)
        const params = new URLSearchParams({
            start: startDate,
            end: endDate,
        });
        if (roomTypeId) params.append('room_type_id', roomTypeId.toString());

        const { data } = await apiClient.get<CalendarAvailability[]>('/calendar/availability', { params });
        return data;
    },

    getBookings: async (startDate: string, endDate: string, roomTypeId?: number, includeCancelled = false) => {
        // Backend expects query params: start, end (not start_date, end_date)
        const params = new URLSearchParams({
            start: startDate,
            end: endDate,
            include_cancelled: includeCancelled.toString(),
        });
        if (roomTypeId) params.append('room_type_id', roomTypeId.toString());

        const { data } = await apiClient.get<BookingEvent[]>('/calendar/bookings', { params });
        return data;
    },
};
