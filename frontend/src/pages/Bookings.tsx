import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/booking';
import { Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export default function Bookings() {
    const { data: bookings, isLoading, error } = useQuery({
        queryKey: ['bookings'],
        queryFn: bookingService.getAll,
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-8">Error loading bookings</div>;



    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500">Manage reservations and check-ins</p>
                </div>
                <Link
                    to="/bookings/new"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    New Booking
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {bookings?.map((booking) => (
                            <tr key={booking.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span className="font-mono text-xs text-gray-500">#</span>{booking.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs mr-3">
                                            {booking.customer?.name?.[0] || 'C'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{booking.customer?.name}</div>
                                            <div className="text-xs text-gray-400">{booking.customer?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {booking.booking_items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5">
                                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-medium">{item.quantity}x</span>
                                            {item.room_type?.name}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{format(new Date(booking.check_in), 'MMM dd')}</span>
                                        <span className="text-xs text-gray-400">to {format(new Date(booking.check_out), 'MMM dd, yyyy')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    ${booking.total_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={clsx(
                                        "px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full border",
                                        booking.status === 'confirmed' && "bg-green-50 text-green-700 border-green-100",
                                        booking.status === 'completed' && "bg-gray-50 text-gray-700 border-gray-100",
                                        booking.status === 'cancelled' && "bg-red-50 text-red-700 border-red-100",
                                        !['confirmed', 'completed', 'cancelled'].includes(booking.status) && "bg-blue-50 text-blue-700 border-blue-100"
                                    )}>
                                        {booking.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
