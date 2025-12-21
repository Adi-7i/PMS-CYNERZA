import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory';
import { roomTypeService } from '../services/roomType';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Inventory() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
    const ITEMS_PER_PAGE = 10;

    // Calculate date range for the current view (month view)
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    // Pagination logic
    const totalPages = Math.ceil(daysInMonth.length / ITEMS_PER_PAGE);
    const paginatedDays = daysInMonth.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    // Format dates for API
    const apiStart = format(startDate, 'yyyy-MM-dd');
    const apiEnd = format(addDays(endDate, 1), 'yyyy-MM-dd');

    const { data: roomTypes } = useQuery({
        queryKey: ['roomTypes'],
        queryFn: roomTypeService.getAll,
    });

    const { data: availability, isLoading } = useQuery({
        queryKey: ['inventory', apiStart, apiEnd, selectedRoomType],
        queryFn: () => inventoryService.getDetailed(
            apiStart,
            apiEnd,
            selectedRoomType !== 'all' ? Number(selectedRoomType) : undefined
        ),
    });

    const generateMutation = useMutation({
        mutationFn: ({ id, days }: { id: number, days: number }) => inventoryService.generate(id, days),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            alert('Inventory generated successfully');
        },
        onError: () => alert('Failed to generate inventory')
    });

    const handleGenerate = () => {
        if (selectedRoomType === 'all') {
            alert('Please select a specific room type to generate inventory');
            return;
        }
        if (confirm('Generate inventory for the next 90 days for this room type?')) {
            generateMutation.mutate({ id: Number(selectedRoomType), days: 90 });
        }
    };

    const previousMonth = () => {
        setCurrentDate(curr => addDays(startOfMonth(curr), -1));
        setPage(0);
    };

    const nextMonth = () => {
        setCurrentDate(curr => addDays(endOfMonth(curr), 1));
        setPage(0);
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    // Helper to find data for a specific day and room type
    const getData = (date: Date, roomTypeId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return availability?.find(a => a.date === dateStr && a.room_type_id === roomTypeId);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500">View and manage availability and rates</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedRoomType}
                        onChange={(e) => setSelectedRoomType(e.target.value)}
                        className="border rounded-md px-3 py-2 bg-white"
                    >
                        <option value="all">All Room Types</option>
                        {roomTypes?.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleGenerate}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50"
                        disabled={selectedRoomType === 'all' || generateMutation.isPending}
                    >
                        <RefreshCw className={cn("h-4 w-4", generateMutation.isPending && "animate-spin")} />
                        Generate
                    </button>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold">
                    {format(startDate, 'MMMM yyyy')}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Inventory Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 w-48 border-b border-gray-200">
                                    Date
                                </th>
                                {roomTypes?.filter(rt => selectedRoomType === 'all' || rt.id === Number(selectedRoomType)).map(rt => (
                                    <th key={rt.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[120px] border-b border-gray-200">
                                        {rt.name}<br />
                                        <span className="text-gray-400 font-normal">Total: {rt.total_rooms}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {paginatedDays.map(day => (
                                <tr key={day.toISOString()} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200 group-hover:bg-slate-50">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{format(day, 'MMM dd')}</span>
                                            <span className="text-xs text-slate-400 font-normal">{format(day, 'EEEE')}</span>
                                        </div>
                                    </td>
                                    {roomTypes?.filter(rt => selectedRoomType === 'all' || rt.id === Number(selectedRoomType)).map(rt => {
                                        const data = getData(day, rt.id);
                                        return (
                                            <td key={`${day}-${rt.id}`} className="px-4 py-3 text-center border-l border-gray-50 last:border-r">
                                                {data ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className={cn(
                                                            "text-sm font-bold px-2 py-0.5 rounded-full mb-1 w-full max-w-[80px]",
                                                            data.available_rooms === 0 ? "bg-red-50 text-red-600" :
                                                                data.available_rooms < 5 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                                                        )}>
                                                            {data.available_rooms} left
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-medium">${data.price}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300 italic">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{page * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min((page + 1) * ITEMS_PER_PAGE, daysInMonth.length)}</span> of <span className="font-medium">{daysInMonth.length}</span> days
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
