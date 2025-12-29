'use client';

import { useRoomTypes } from '@/lib/hooks/use-rooms';
import { RoomTypeTable } from '@/components/rooms/room-type-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
    const router = useRouter();
    const { data: roomTypesData, isLoading } = useRoomTypes();

    // Normalize data access
    const roomTypes = Array.isArray(roomTypesData) ? roomTypesData : (roomTypesData as any)?.data || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Room Types</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your hotel room categories and pricing.</p>
                </div>
                <Button onClick={() => router.push('/rooms/new')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Room Type
                </Button>
            </div>

            <RoomTypeTable data={roomTypes} isLoading={isLoading} />
        </div>
    );
}
