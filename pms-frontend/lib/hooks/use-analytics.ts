import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export function useOverviewAnalytics(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['analytics', 'overview', startDate, endDate],
        queryFn: () => analyticsApi.getOverview(startDate, endDate),
        staleTime: 60000, // 1 minute
    });
}

export function useRevenueAnalytics(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['analytics', 'revenue', startDate, endDate],
        queryFn: () => analyticsApi.getRevenue(startDate, endDate),
        staleTime: 60000,
    });
}

export function useRoomTypeAnalytics(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['analytics', 'room-types', startDate, endDate],
        queryFn: () => analyticsApi.getRoomTypePerformance(startDate, endDate),
        staleTime: 60000,
    });
}

export function useBookingTrendAnalytics(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['analytics', 'bookings', startDate, endDate],
        queryFn: () => analyticsApi.getBookingTrends(startDate, endDate),
        staleTime: 60000,
    });
}
