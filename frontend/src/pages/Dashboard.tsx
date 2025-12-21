import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/booking';
import { roomTypeService } from '../services/roomType';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['bookings'],
        queryFn: bookingService.getAll,
    });

    const { data: roomTypes, isLoading: isLoadingRooms } = useQuery({
        queryKey: ['roomTypes'],
        queryFn: roomTypeService.getAll,
    });

    if (isLoadingBookings || isLoadingRooms) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    const totalRevenue = bookings?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
    const totalBookings = bookings?.length || 0;
    const totalRoomTypes = roomTypes?.length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalBookings}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <span>+12% from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Room Types</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalRoomTypes}</p>
                        </div>
                        <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>Across all categories</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <span>+8.2% from last month</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
