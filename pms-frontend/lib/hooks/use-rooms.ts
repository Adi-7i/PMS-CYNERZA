import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '@/lib/api/rooms';
import { RoomTypeCreate } from '@/types/room';
import { toast } from 'sonner';

export function useRoomTypes() {
    return useQuery({
        queryKey: ['room-types'],
        queryFn: roomApi.getTypes,
    });
}

export function useRoomType(id: number) {
    return useQuery({
        queryKey: ['room-type', id],
        queryFn: () => roomApi.getTypeById(id),
        enabled: !!id,
    });
}

// Mutations can be added later as needed
