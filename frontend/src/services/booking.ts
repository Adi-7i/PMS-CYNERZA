import { api } from '../lib/axios';
import type { RoomType } from './roomType';

export const BookingStatus = {
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
    CHECKED_IN: "checked_in",
    CHECKED_OUT: "checked_out"
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface Booking {
    id: number;
    customer_id: number;
    check_in: string;
    check_out: string;
    total_amount: number;
    status: BookingStatus;
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    booking_items: {
        id: number;
        room_type: RoomType;
        quantity: number;
        price_per_night: number;
    }[];
}

export const bookingService = {
    getAll: async () => {
        const response = await api.get<Booking[]>('/bookings');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Booking>(`/bookings/${id}`);
        return response.data;
    },

    // will add createMultiRoom later
    createMultiRoom: async (data: any) => {
        const response = await api.post('/multi-room-bookings', data);
        return response.data;
    }
};
