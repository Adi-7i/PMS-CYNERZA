import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/bookings';
import { BookingCreate } from '@/types/booking';
import { toast } from 'sonner';

export function useBookings(page = 1, limit = 10, status?: string, dateFrom?: string, dateTo?: string) {
    return useQuery({
        queryKey: ['bookings', page, limit, status, dateFrom, dateTo],
        queryFn: () => bookingApi.getAll(page, limit, status, dateFrom, dateTo),
    });
}

export function useBooking(id: number) {
    return useQuery({
        queryKey: ['booking', id],
        queryFn: () => bookingApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookingApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            // Invalidate calendar availability if it exists
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            toast.success('Booking created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create booking');
        },
    });
}

export function useModifyBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<BookingCreate> }) =>
            bookingApi.modify(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            toast.success('Booking updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update booking');
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            bookingApi.cancel(id, reason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            toast.success('Booking cancelled successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to cancel booking');
        },
    });
}
