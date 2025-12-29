'use client';

import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isToday,
    isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarAvailability } from '@/lib/hooks/use-calendar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function MonthView() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());

    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfWeek(endOfMonth(currentDate));

    // Format dates for API
    const apiStartDate = format(startDate, 'yyyy-MM-dd');
    const apiEndDate = format(endDate, 'yyyy-MM-dd');

    const { data: availability, isLoading } = useCalendarAvailability(apiStartDate, apiEndDate);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const getAvailabilityForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Backend returns flat array with one entry per room type per date
        // Group them by date
        const roomTypesForDate = availability?.filter((a) => a.date === dateStr) || [];

        if (roomTypesForDate.length === 0) return null;

        return {
            date: dateStr,
            room_types: roomTypesForDate.map((a) => ({
                id: a.room_type_id,
                name: a.room_type_name,
                available: a.available_rooms,
                booked: a.total_rooms - a.available_rooms,
                total: a.total_rooms,
                status: a.status,
            })),
        };
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center rounded-md border bg-background shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={goToToday} className="h-8 px-2 font-normal">
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Legend or other controls could go here */}
                </div>
            </div>

            <div className="rounded-lg border bg-background shadow">
                <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-sm font-medium text-muted-foreground">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 divide-x divide-y">
                    {days.map((day) => {
                        const dayAvailability = getAvailabilityForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);

                        // Simple availability summary: total available across all room types
                        const totalAvailable = dayAvailability?.room_types?.reduce(
                            (sum, rt) => sum + rt.available,
                            0,
                        ) || 0;

                        const totalBooked = dayAvailability?.room_types?.reduce(
                            (sum, rt) => sum + rt.booked,
                            0,
                        ) || 0;


                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    'group relative min-h-[120px] p-2 transition-colors hover:bg-muted/50',
                                    !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
                                    isTodayDate && 'bg-indigo-50/50 dark:bg-indigo-950/20',
                                )}
                                onClick={() => router.push(`/bookings/new?check_in=${format(day, 'yyyy-MM-dd')}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={cn(
                                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                                            isTodayDate && 'bg-indigo-600 text-white',
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {isCurrentMonth && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/bookings/new?check_in=${format(day, 'yyyy-MM-dd')}`);
                                            }}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <div className="mt-2 space-y-1">
                                    {isCurrentMonth && dayAvailability && (
                                        <>
                                            {dayAvailability.room_types.slice(0, 3).map((rt) => (
                                                <div key={rt.id} className="flex justify-between text-[10px]">
                                                    <span className="truncate max-w-[80px] text-muted-foreground" title={rt.name}>{rt.name}</span>
                                                    <span className={cn(
                                                        "font-medium",
                                                        rt.available === 0 ? "text-red-500" : "text-green-600"
                                                    )}>
                                                        {rt.available}
                                                    </span>
                                                </div>
                                            ))}
                                            {dayAvailability.room_types.length > 3 && (
                                                <div className="text-[10px] text-muted-foreground text-center pt-1">
                                                    + {dayAvailability.room_types.length - 3} more
                                                </div>
                                            )}
                                            {/* Summary line if needed */}
                                            {/* <div className="mt-2 text-xs font-medium text-center text-indigo-600">
                                                {totalAvailable} left
                                             </div> */}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
