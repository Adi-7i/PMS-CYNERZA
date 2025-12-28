import { apiClient } from './client';
import type {
    OverviewAnalytics,
    RevenueAnalytics,
    RoomTypeAnalytics,
    BookingTrendAnalytics
} from '@/types/analytics';

export const analyticsApi = {
    getOverview: async (startDate: string, endDate: string) => {
        const { data } = await apiClient.get<OverviewAnalytics>('/analytics/overview', {
            params: { start: startDate, end: endDate },
        });
        return data;
    },

    getRevenue: async (startDate: string, endDate: string) => {
        const { data } = await apiClient.get<RevenueAnalytics>('/analytics/revenue', {
            params: { start: startDate, end: endDate },
        });
        return data;
    },

    getRoomTypePerformance: async (startDate: string, endDate: string) => {
        const { data } = await apiClient.get<RoomTypeAnalytics>('/analytics/room-types', {
            params: { start: startDate, end: endDate },
        });
        return data;
    },

    getBookingTrends: async (startDate: string, endDate: string) => {
        const { data } = await apiClient.get<BookingTrendAnalytics>('/analytics/bookings', {
            params: { start: startDate, end: endDate },
        });
        return data;
    },
};
