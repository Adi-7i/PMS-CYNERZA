import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '@/lib/api/rooms';
import { RoomTypeCreate } from '@/types/room';
import { toast } from 'sonner';

export function useRoomTypes() {
    return useQuery({
        queryKey: ['room-types'],
        queryFn: () => roomApi.getTypes(),
        staleTime: 30000,
    });
}

export function useRoomType(id: number) {
    return useQuery({
        queryKey: ['room-type', id],
        queryFn: () => roomApi.getTypeById(id),
        enabled: !!id,
    });
}

export function useCreateRoomType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: roomApi.createType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['room-types'] });
            toast.success('Room type created successfully');
        },
        onError: () => {
            toast.error('Failed to create room type');
        },
    });
}

export function useUpdateRoomType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<RoomTypeCreate> }) =>
            roomApi.updateType(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['room-types'] });
            queryClient.invalidateQueries({ queryKey: ['room-type', data.id] });
            toast.success('Room type updated successfully');
        },
        onError: () => {
            toast.error('Failed to update room type');
        },
    });
}

export function useDeleteRoomType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: roomApi.deleteType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['room-types'] });
            toast.success('Room type deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete room type');
        },
    });
}
