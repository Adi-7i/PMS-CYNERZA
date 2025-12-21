import { apiClient } from './client';
import type { Booking, BookingCreate } from '@/types/booking';

export const bookingApi = {
    getAll: async (page = 1, limit = 10, status?: string, dateFrom?: string, dateTo?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (status) params.append('status', status);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        const { data } = await apiClient.get<{ data: Booking[]; total: number; page: number; limit: number }>('/bookings', { params });
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
        // Some backends might use POST for actions, adhering to rules
        const { data } = await apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason });
        return data;
    },

    checkAvailability: async (checkIn: string, checkOut: string, roomTypeId?: number) => {
        const params = new URLSearchParams({
            check_in: checkIn,
            check_out: checkOut
        });
        if (roomTypeId) params.append('room_type_id', roomTypeId.toString());

        const { data } = await apiClient.get<any>('/calendar/availability', { params }); // returning raw availability data
        return data;
    }
};
