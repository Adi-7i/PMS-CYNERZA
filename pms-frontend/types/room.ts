export interface RoomType {
    id: number;
    name: string;
    description?: string;
    base_price: number;
    total_rooms: number;
    created_at: string;
    updated_at?: string;
}

export interface RoomTypeCreate {
    name: string;
    description?: string;
    base_price: number;
    total_rooms: number;
}
