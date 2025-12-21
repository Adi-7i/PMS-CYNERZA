import { apiClient } from './client';
import type { RoomType, RoomTypeCreate } from '@/types/room';

export const roomApi = {
    getTypes: async () => {
        // Assuming GET /room-types returns a list
        const { data } = await apiClient.get<RoomType[]>('/room-types');
        return data;
    },

    getTypeById: async (id: number) => {
        const { data } = await apiClient.get<RoomType>(`/room-types/${id}`);
        return data;
    },

    createType: async (roomType: RoomTypeCreate) => {
        const { data } = await apiClient.post<RoomType>('/room-types', roomType);
        return data;
    },

    updateType: async (id: number, roomType: Partial<RoomTypeCreate>) => {
        const { data } = await apiClient.put<RoomType>(`/room-types/${id}`, roomType);
        return data;
    },

    deleteType: async (id: number) => {
        await apiClient.delete(`/room-types/${id}`);
    }
};
