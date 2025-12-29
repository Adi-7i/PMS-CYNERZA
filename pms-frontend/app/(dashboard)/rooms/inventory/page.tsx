'use client';

import { useRoomTypes } from '@/lib/hooks/use-rooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Save } from 'lucide-react';
import { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { toast } from 'sonner';

export default function InventoryPage() {
    const { data: roomTypesData, isLoading } = useRoomTypes();
    const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Normalize data access
    const roomTypes = Array.isArray(roomTypesData) ? roomTypesData : (roomTypesData as any)?.data || [];

    // Generate 14-day range
    const dateRange = Array.from({ length: 14 }, (_, i) => addDays(startDate, i));

    const handlePrevWeek = () => setStartDate(addWeeks(startDate, -1));
    const handleNextWeek = () => setStartDate(addWeeks(startDate, 1));

    const handleSaveInventory = () => {
        toast.success('Inventory changes saved (demo mode)');
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <p className="text-zinc-500">Loading inventory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Inventory Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage room availability and inventory by date.</p>
                </div>
                <Button onClick={handleSaveInventory} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Inventory Calendar
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextWeek}>
                            Next
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-3 pr-4 text-left font-medium text-zinc-500 w-48">Room Type</th>
                                    {dateRange.map((date) => (
                                        <th key={date.toISOString()} className="pb-3 px-2 text-center font-medium text-zinc-500 min-w-[80px]">
                                            <div className="text-xs">{format(date, 'EEE')}</div>
                                            <div>{format(date, 'MMM d')}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {roomTypes.map((roomType: any) => (
                                    <tr key={roomType.id} className="border-b last:border-b-0">
                                        <td className="py-3 pr-4">
                                            <div className="font-medium text-zinc-900 dark:text-white">{roomType.name}</div>
                                            <div className="text-xs text-zinc-500">Total: {roomType.total_inventory} rooms</div>
                                        </td>
                                        {dateRange.map((date) => (
                                            <td key={date.toISOString()} className="py-3 px-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={roomType.total_inventory}
                                                    defaultValue={roomType.total_inventory}
                                                    className="w-16 text-center h-8 text-sm"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Update</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-zinc-500 mb-4">
                        Use this section to quickly update inventory for a date range.
                    </p>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Room Type</label>
                            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select room type</option>
                                {roomTypes.map((rt: any) => (
                                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">From Date</label>
                            <Input type="date" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">To Date</label>
                            <Input type="date" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Available Rooms</label>
                            <Input type="number" min="0" placeholder="e.g., 10" />
                        </div>
                    </div>
                    <Button className="mt-4" variant="secondary">
                        Apply to Date Range
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
