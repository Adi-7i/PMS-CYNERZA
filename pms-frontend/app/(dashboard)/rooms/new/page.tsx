import { RoomTypeForm } from '@/components/rooms/room-type-form';

export default function NewRoomTypePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">New Room Type</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Create a new room category for your hotel.</p>
            </div>
            <div className="max-w-2xl">
                <RoomTypeForm />
            </div>
        </div>
    );
}
