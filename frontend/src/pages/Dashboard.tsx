import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import { Users, Building2, DollarSign, Loader2, TrendingUp, TrendingDown, Calendar, Target, PieChart } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import React, { useState } from 'react';

export default function Dashboard() {
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    // Fetch all analytics data
    const { data: overview, isLoading: overviewLoading } = useQuery({
        queryKey: ['analytics-overview', dateRange.start, dateRange.end],
        queryFn: () => analyticsService.getOverview(dateRange.start, dateRange.end),
    });

    const { data: revenue, isLoading: revenueLoading } = useQuery({
        queryKey: ['analytics-revenue', dateRange.start, dateRange.end],
        queryFn: () => analyticsService.getRevenue(dateRange.start, dateRange.end),
    });

    const { data: roomTypes, isLoading: roomTypesLoading } = useQuery({
        queryKey: ['analytics-room-types', dateRange.start, dateRange.end],
        queryFn: () => analyticsService.getRoomTypes(dateRange.start, dateRange.end),
    });

    const { data: bookingTrends, isLoading: trendsLoading } = useQuery({
        queryKey: ['analytics-bookings', dateRange.start, dateRange.end],
        queryFn: () => analyticsService.getBookingTrends(dateRange.start, dateRange.end),
    });

    const isLoading = overviewLoading || revenueLoading || roomTypesLoading || trendsLoading;
    const isError = !isLoading && (!overview || !revenue || !roomTypes || !bookingTrends);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center p-20 text-center">
                <p className="text-red-600 mb-4">Failed to load analytics data.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6">
            {/* Header with Date Range Selector */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-500 mt-1">Comprehensive analytics and insights</p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => {
                            const today = new Date();
                            setDateRange({
                                start: format(subDays(today, 30), 'yyyy-MM-dd'),
                                end: format(today, 'yyyy-MM-dd')
                            });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Last 30 Days
                    </button>
                    <button
                        onClick={() => {
                            setDateRange({
                                start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                                end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
                            });
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`$${Number(overview?.total_revenue ?? 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="text-green-600"
                    bgColor="bg-green-50"
                    trend="+12.5%"
                />
                <KPICard
                    title="Total Bookings"
                    value={overview?.total_bookings?.toString() ?? '0'}
                    subtitle={`${overview?.confirmed_bookings ?? 0} confirmed`}
                    icon={Calendar}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    trend="+8.3%"
                />
                <KPICard
                    title="Occupancy Rate"
                    value={`${Number(overview?.occupancy_rate ?? 0).toFixed(1)}%`}
                    icon={Building2}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                    trend="-2.1%"
                />
                <KPICard
                    title="Avg Daily Rate"
                    value={`$${Number(overview?.average_daily_rate ?? 0).toFixed(0)}`}
                    subtitle="ADR"
                    icon={Target}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                    trend="+5.2%"
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Confirmed Bookings"
                    value={overview?.confirmed_bookings?.toString() ?? '0'}
                    icon={Users}
                    color="text-green-600"
                />
                <MetricCard
                    title="Cancelled Bookings"
                    value={overview?.cancelled_bookings?.toString() ?? '0'}
                    icon={TrendingDown}
                    color="text-red-600"
                />
                <MetricCard
                    title="Average Daily Revenue"
                    value={`$${Number(revenue?.average_daily_revenue ?? 0).toFixed(0)}`}
                    icon={TrendingUp}
                    color="text-blue-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Revenue Trend
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue?.daily_revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickFormatter={(str: string) => format(new Date(str), 'MMM dd')}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Trends Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Booking Trends
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookingTrends?.daily_trends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickFormatter={(str: string) => format(new Date(str), 'MMM dd')}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Legend />
                                <Bar dataKey="bookings" fill="#4f46e5" name="Bookings" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cancellations" fill="#ef4444" name="Cancellations" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Room Type Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Room Type Distribution Chart */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        Room Type Share
                    </h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={roomTypes?.room_types as any || []}
                                    nameKey="room_type_name"
                                    dataKey="booking_share_percentage"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {roomTypes?.room_types.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Room Type Performance Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Room Type Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Room Type</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Rooms Booked</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomTypes?.room_types.map((room, index) => (
                                    <tr key={room.room_type_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="font-medium text-gray-900">{room.room_type_name}</span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 text-gray-700">{room.total_rooms_booked}</td>
                                        <td className="text-right py-3 px-4 text-gray-700 font-semibold">
                                            ${Number(room.total_revenue).toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span className="text-gray-700 font-medium">
                                                {Number(room.booking_share_percentage).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Peak Performance Insights */}
            {bookingTrends?.peak_booking_day && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Peak Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Peak Booking Day</p>
                            <p className="text-xl font-bold text-gray-900">
                                {format(new Date(bookingTrends.peak_booking_day), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">{bookingTrends.peak_booking_count} bookings</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Period Bookings</p>
                            <p className="text-xl font-bold text-gray-900">{bookingTrends.total_bookings}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Cancellations</p>
                            <p className="text-xl font-bold text-gray-900">{bookingTrends.total_cancellations}</p>
                            <p className="text-sm text-red-600 mt-1">
                                {((bookingTrends.total_cancellations / bookingTrends.total_bookings) * 100).toFixed(1)}% rate
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface KPICardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    trend?: string;
}

function KPICard({ title, value, subtitle, icon: Icon, color, bgColor, trend }: KPICardProps) {
    const isPositive = trend?.startsWith('+');
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className={`h-12 w-12 ${bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <Icon className={`h-10 w-10 ${color}`} />
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
