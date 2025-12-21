export interface RoomType {
    id: number;
    name: string;
    description?: string;
    base_price: number;
    capacity_adults: number;
    capacity_children: number;
    total_inventory: number;
    created_at: string;
    updated_at: string;
}

export interface RoomTypeCreate {
    name: string;
    description?: string;
    base_price: number;
    capacity_adults: number;
    capacity_children: number;
    total_inventory: number;
}
