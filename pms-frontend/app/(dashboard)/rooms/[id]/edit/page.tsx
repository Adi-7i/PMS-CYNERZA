'use client';

import { useRoomType } from '@/lib/hooks/use-rooms';
import { RoomTypeForm } from '@/components/rooms/room-type-form';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditRoomTypePage() {
    const params = useParams();
    const roomTypeId = Number(params.id);
    const { data: roomType, isLoading } = useRoomType(roomTypeId);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!roomType) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Room type not found</h2>
                <p className="text-zinc-500">The requested room type does not exist.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Edit Room Type</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Modify the room type details and pricing.</p>
            </div>
            <div className="max-w-2xl">
                <RoomTypeForm initialData={roomType} roomTypeId={roomTypeId} />
            </div>
        </div>
    );
}
