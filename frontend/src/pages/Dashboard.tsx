import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/booking';
import { roomTypeService } from '../services/roomType';
import { Users, Building2, CalendarCheck, DollarSign, Loader2 } from 'lucide-react';
import { format, isToday, parseISO, addDays, startOfDay } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import React from 'react';

export default function Dashboard() {
    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: bookingService.getAll,
    });

    const { data: roomTypes, isLoading: roomsLoading } = useQuery({
        queryKey: ['roomTypes'],
        queryFn: roomTypeService.getAll,
    });

    if (bookingsLoading || roomsLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    // Calculate metrics
    const totalRevenue = bookings?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
    const activeBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'checked_in')?.length ?? 0;
    const todaysCheckins = bookings?.filter(b => isToday(parseISO(b.check_in)))?.length ?? 0;

    // Calculate Occupancy (simplified)
    const totalRooms = roomTypes?.reduce((acc, curr) => acc + curr.total_rooms, 0) || 1;

    const today = new Date();
    const occupiedRooms = bookings?.filter(b => {
        const start = parseISO(b.check_in);
        const end = parseISO(b.check_out);
        return today >= start && today < end && (b.status === 'confirmed' || b.status === 'checked_in');
    })?.length ?? 0;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    // ... (chart data prep remains same)

    // ... inside return ...


    // Prepare Chart Data (Next 14 Days Forecast)
    const chartData = Array.from({ length: 14 }).map((_, i) => {
        const date = addDays(startOfDay(new Date()), i);
        const dateStr = format(date, 'yyyy-MM-dd');

        // Sum revenue for bookings CHECKING IN on this day (Revenue Inflow)
        const dailyRevenue = bookings
            ?.filter(b => b.check_in === dateStr && b.status !== 'cancelled')
            .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

        return {
            date: dateStr,
            revenue: dailyRevenue
        };
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+12.5%"
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <DashboardCard
                    title="Active Bookings"
                    value={activeBookings.toString()}
                    icon={CalendarCheck}
                    trend="+4.3%"
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <DashboardCard
                    title="Check-ins Today"
                    value={todaysCheckins.toString()}
                    icon={Users}
                    trend="+2.1%"
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                />
                <DashboardCard
                    title="Room Occupancy"
                    value={`${occupancyRate}%`}
                    icon={Building2}
                    trend="-1.2%"
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (Next 14 Days)</h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={(str: string) => format(new Date(str), 'MMM dd')}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={(value: number) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                {/* Placeholder for list */}
                <div className="p-6 text-center text-gray-500 text-sm">
                    No recent bookings to display.
                </div>
            </div>
        </div>
    );
}

interface DashboardCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend: string;
    color: string;
    bgColor: string;
}

function DashboardCard({ title, value, icon: Icon, trend, color, bgColor }: DashboardCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`h-12 w-12 ${bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <div className={`mt-4 flex items-center text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                <span>{trend} from last month</span>
            </div>
        </div>
    );
}
