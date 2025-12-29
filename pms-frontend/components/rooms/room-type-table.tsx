'use client';

import { RoomType } from '@/types/room';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoomTypeTableProps {
    data: RoomType[];
    isLoading: boolean;
    onDelete?: (id: number) => void;
}

export function RoomTypeTable({ data, isLoading, onDelete }: RoomTypeTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="rounded-md border p-8 text-center text-zinc-500">
                Loading room types...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-zinc-500">
                No room types found. Create your first room type to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Base Price</TableHead>
                        <TableHead className="text-center">Total Rooms</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((roomType) => (
                        <TableRow key={roomType.id}>
                            <TableCell className="font-medium">{roomType.name}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-zinc-500">
                                {roomType.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                ${Number(roomType.base_price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">{roomType.total_rooms}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/rooms/${roomType.id}/edit`)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => onDelete(roomType.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
