import { apiClient } from './client';
import type { Booking, BookingCreate } from '@/types/booking';

export const bookingApi = {
    getAll: async (page = 1, limit = 10, statusFilter?: string, fromDate?: string, toDate?: string) => {
        const offset = (page - 1) * limit;
        const params = new URLSearchParams({
            offset: offset.toString(),
            limit: limit.toString(),
        });
        if (statusFilter) params.append('status_filter', statusFilter);
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);

        const { data } = await apiClient.get<Booking[]>('/bookings', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
        return data;
    },

    create: async (booking: BookingCreate) => {
        const { data } = await apiClient.post<Booking>('/bookings', booking);
        return data;
    },

    modify: async (id: number, updates: Partial<BookingCreate>) => {
        const { data } = await apiClient.put<Booking>(`/bookings/${id}/modify`, updates);
        return data;
    },

    cancel: async (id: number, reason?: string) => {
        const { data } = await apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason });
        return data;
    },

    checkAvailability: async (checkIn: string, checkOut: string, roomTypeId?: number) => {
        const params = new URLSearchParams({
            start_date: checkIn,
            end_date: checkOut
        });
        if (roomTypeId) params.append('room_type_id', roomTypeId.toString());

        const { data } = await apiClient.get<any>('/calendar/availability', { params });
        return data;
    }
};
