import { api } from '../lib/axios';

export interface DateRangeAvailability {
    room_type_id: number;
    room_type_name: string;
    start_date: string;
    end_date: string;
    min_available: number;
    total_price: number;
    daily_breakdown: any[]; // define stricter if needed
}

export interface InventoryRead {
    id: number;
    room_type_id: number;
    room_type_name: string;
    date: string;
    available_rooms: number;
    price: number;
}

export interface InventoryUpdate {
    available_rooms?: number;
    price?: number;
}

export const inventoryService = {
    getAvailability: async (start: string, end: string, roomTypeId?: number) => {
        const params = new URLSearchParams({ start, end });
        if (roomTypeId) params.append('room_type_id', roomTypeId.toString());

        const response = await api.get<DateRangeAvailability[]>(`/inventory?${params.toString()}`);
        return response.data;
    },

    getDetailed: async (start: string, end: string, roomTypeId?: number) => {
        const params = new URLSearchParams({ start, end });
        if (roomTypeId) params.append('room_type_id', roomTypeId.toString());

        const response = await api.get<InventoryRead[]>(`/inventory/detailed?${params.toString()}`);
        return response.data;
    },

    update: async (id: number, data: InventoryUpdate) => {
        const response = await api.put<InventoryRead>(`/inventory/${id}`, data);
        return response.data;
    },

    generate: async (roomTypeId: number, daysAhead: number = 90) => {
        const response = await api.post(`/inventory/generate/${roomTypeId}?days_ahead=${daysAhead}`);
        return response.data;
    }
};
