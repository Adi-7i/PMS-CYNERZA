import { api } from '../lib/axios';

export interface OverviewAnalytics {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    total_revenue: number;
    average_daily_rate: number;
    occupancy_rate: number;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
    booking_count: number;
}

export interface RevenueAnalytics {
    daily_revenue: DailyRevenue[];
    total_revenue: number;
    average_daily_revenue: number;
}

export interface RoomTypePerformance {
    room_type_name: string;
    room_type_id: number;
    total_rooms_booked: number;
    total_revenue: number;
    booking_share_percentage: number;
}

export interface RoomTypeAnalytics {
    room_types: RoomTypePerformance[];
    total_revenue: number;
}

export interface DailyBookingTrend {
    date: string;
    bookings: number;
    cancellations: number;
}

export interface BookingTrendAnalytics {
    daily_trends: DailyBookingTrend[];
    peak_booking_day: string | null;
    peak_booking_count: number;
    total_bookings: number;
    total_cancellations: number;
}

export const analyticsService = {
    getOverview: async (start: string, end: string): Promise<OverviewAnalytics> => {
        const response = await api.get<OverviewAnalytics>(`/analytics/overview?start=${start}&end=${end}`);
        return response.data;
    },

    getRevenue: async (start: string, end: string): Promise<RevenueAnalytics> => {
        const response = await api.get<RevenueAnalytics>(`/analytics/revenue?start=${start}&end=${end}`);
        return response.data;
    },

    getRoomTypes: async (start: string, end: string): Promise<RoomTypeAnalytics> => {
        const response = await api.get<RoomTypeAnalytics>(`/analytics/room-types?start=${start}&end=${end}`);
        return response.data;
    },

    getBookingTrends: async (start: string, end: string): Promise<BookingTrendAnalytics> => {
        const response = await api.get<BookingTrendAnalytics>(`/analytics/bookings?start=${start}&end=${end}`);
        return response.data;
    },
};
