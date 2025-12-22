import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customer';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function CustomerDetails() {
    const { id } = useParams<{ id: string }>();

    const { data: customer, isLoading, error } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => customerService.getById(Number(id)),
        enabled: !!id
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error || !customer) return <div className="p-8 text-center text-red-500">Failed to load customer details</div>;

    // Analytics Calculation
    const totalBookings = customer.bookings.length;
    const totalSpent = customer.bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    const totalPaid = customer.bookings.reduce((sum, b) => sum + Number(b.amount_paid), 0);
    const outstandingBalance = Number(customer.total_balance_due);

    const getStatusParams = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle };
            case 'cancelled': return { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
            case 'checked_in': return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock };
            case 'checked_out': return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: CheckCircle };
            default: return { color: 'bg-gray-50 text-gray-600 border-gray-200', icon: Clock };
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link to="/customers" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 w-fit transition-colors group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Customers
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                        <p className="text-gray-500 mt-1">Customer Profile & History</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                        Member since {format(new Date(customer.created_at), 'MMM yyyy')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                            Contact Details
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                                    <p className="text-gray-900 break-all">{customer.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                    <p className="text-gray-900">{customer.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="text-gray-900">{customer.address || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">ID Proof</p>
                                        <p className="text-gray-900 capitalize">{customer.id_proof_type || 'None'}</p>
                                        <p className="text-xs text-gray-500">{customer.id_proof_number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Card (Mobile only, hidden on large screens if desired, but good to keep visible) */}
                </div>

                {/* Right Column: Analytics & Bookings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{totalBookings}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
                            <p className={cn("text-2xl font-bold mt-1", outstandingBalance > 0 ? "text-red-600" : "text-green-600")}>
                                ${outstandingBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Booking History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Booking History
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {customer.bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No bookings found for this customer.
                                            </td>
                                        </tr>
                                    ) : (
                                        customer.bookings.map((booking) => {
                                            const status = getStatusParams(booking.status);
                                            const StatusIcon = status.icon;
                                            return (
                                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                        #{booking.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {booking.room_type_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex flex-col">
                                                            <span>{format(new Date(booking.check_in), 'MMM dd, yyyy')}</span>
                                                            <span className="text-xs text-gray-400">to {format(new Date(booking.check_out), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", status.color)}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                        ${Number(booking.total_amount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}
