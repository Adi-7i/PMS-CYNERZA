import { api } from '../lib/axios';

export interface RoomType {
    id: number;
    name: string;
    description?: string;
    total_rooms: number;
    base_price: number;
    created_at: string;
    updated_at: string;
}

export interface RoomTypeCreate {
    name: string;
    description?: string;
    total_rooms: number;
    base_price: number;
}

export const roomTypeService = {
    getAll: async () => {
        const response = await api.get<RoomType[]>('/room-types');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<RoomType>(`/room-types/${id}`);
        return response.data;
    },

    create: async (data: RoomTypeCreate) => {
        const response = await api.post<RoomType>('/room-types', data);
        return response.data;
    },

    update: async (id: number, data: Partial<RoomTypeCreate>) => {
        const response = await api.put<RoomType>(`/room-types/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/room-types/${id}`);
    },
};
